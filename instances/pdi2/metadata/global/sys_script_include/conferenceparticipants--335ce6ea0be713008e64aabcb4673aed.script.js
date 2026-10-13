/**
 * @typedef {{
			table: string,
			sysId: string,
			confId?: string,
			}} InputData
 * @typedef {Array<{
					 name: string,
					 id: string,
					 phoneNumber?: string,
					 showGroupName?: boolean,
					 users?: Array<{name: string, id: string, phoneNumber?: string}>}>} ParticipantData
 * @typedef {{table: string, sysId: string, confId: string, items: ParticipantData}} ConfInputData
*/
var ConferenceParticipants = Class.create();
ConferenceParticipants.prototype = {
	ACTION: {
		SELF_JOIN: 'selfJoin',
		SEND_SMS: 'sendSms'
	},

	initialize: function () {
		this.notifyUtils = new global.NotifyUtil();
	},
	/**
	 * @param {InputData} inputData
	 * @param {ParticipantData} previousContacts
	 * @returns {ParticipantData}
	 */
	getContacts: function (inputData, previousContacts, type) {
		var sourceGr = new GlideRecord(inputData.table);
		if (!sourceGr.get(inputData.sysId) || !sourceGr.instanceOf('task'))
			return [];
		var contacts = [];
		// Return all contacts based on sys_user reference fields.
		var numbers = [];
		var fields = sourceGr.getFields();
		for (var i = 0; i < fields.size(); i++) {
			/**
			 * @type {GlideElement}
			 */
			var field = fields.get(i);
			if (!field)
				continue;
			if (field.nil())
				continue;
			var ed = field.getED();
			if (!ed.isReference())
				continue;
			var refRec = field.getRefRecord();
			var absBase = GlideDBObjectManager.getAbsoluteBase(refRec.getTableName());
			if (absBase != 'sys_user')
				continue;
			if (!refRec.active)
				continue;
			numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [field.sys_id + ''], [], type);
			var ob = {
				name: gs.getMessage('{0} ({1})', [field.getDisplayValue(), field.getLabel()]),
				id: field.sys_id + '',
				phoneNumber: numbers.length > 0 ? numbers[0] : ''
			};
			contacts.push(ob);
		}

		if (!sourceGr.isValidField('assignment_group'))
			return contacts;
		if (sourceGr.assignment_group.nil())
			return contacts;

		/**
		 * @type {SysUserGroupGR}
		 */
		var groupRefRec = sourceGr.assignment_group.getRefRecord();
		if (!groupRefRec.isValidRecord() || !groupRefRec.active)
			return contacts;

		contacts.push({
			name: groupRefRec.name + '',
			id: groupRefRec.sys_id + '',
			users: [] // The users are resolved later by getGroupMembers
		});
		if (groupRefRec.manager.nil())
			return contacts;

		numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [groupRefRec.manager + ''], [], type);
		contacts.push({
			name: gs.getMessage("{0} ({1})", [groupRefRec.manager.getDisplayValue(), groupRefRec.manager.getLabel()]),
			id: groupRefRec.manager + '',
			phoneNumber: numbers.length > 0 ? numbers[0] : ''
		});
		return contacts;
	},

	/**
	 * @param {string} groupId
	 * @param {InputData} inputData
	 * @param {ParticipantData} groupData
	 * @returns {ParticipantData}
	 */
	getGroupDetails: function (groupId, inputData, alreadyGotGroupDetails, type) {
		var sourceGr = new GlideRecord(inputData.table);
		if (!sourceGr.get(inputData.sysId) || !sourceGr.instanceOf('task'))
			return;

		var grpGr = new GlideRecord("sys_user_group");
		if (!grpGr.get(groupId) || !grpGr.active)
			return;

		if (GlidePluginManager.isActive("com.snc.on_call_rotation")) // If On-Call is active then do not contribute
			return;

		// Return all users in the group (upto a limit)
		var userGr = new GlideRecord("sys_user");
		userGr.addActiveQuery();
		var cond = userGr.addJoinQuery("sys_user_grmember", "sys_id", "user");
		cond.addCondition("group", groupId);
		userGr.setLimit(parseInt(gs.getProperty("glide.notify.ontask.max_users_to_fetch_per_group", "50")));
		userGr.query();
		var numbers;
		var contacts = [];
		while (userGr.next()) {
			numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue() + ''], [], type);
			contacts.push({
				name: gs.getMessage("{0} ({1})", [userGr.getDisplayValue(), grpGr.getDisplayValue()]),
				id: userGr.getUniqueValue() + '',
				phoneNumber: numbers.length > 0 ? numbers[0] : ''
			});
		}
		return {users: contacts};
	},

	/**
	 * @param {GlideRecord} src
	 * @param {string} userId
	 */
	isConferenceLeader: function(src, userId) {
		if (src instanceof GlideRecord) {
			if (userId) {
				var sessionUserId = gs.getUserID();
				if(sessionUserId === userId) {
					return src.canRead();
				} else {
					var userObj = GlideUser.getUserByID(userId);
					if (userObj)
						return userObj.hasRoles();
					else
						return false;
				}
			}
			return gs.getUser().hasRoles();
		}
		return;
	},

	/**
	 * @param {string} actionName
	 * @param {GlideRecord} sourceGr
	 * @param {string} userId
	 */
	isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {
		if (actionName === this.ACTION.SELF_JOIN || actionName === this.ACTION.SEND_SMS)
			return this.isConferenceLeader(sourceGr, userId);
		return;
	},

	type: 'ConferenceParticipants'
};
