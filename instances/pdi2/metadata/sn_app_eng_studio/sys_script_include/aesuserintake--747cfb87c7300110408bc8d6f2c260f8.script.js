var AESUserIntake = Class.create();
AESUserIntake.prototype = {
    initialize: function() {
    },

	/**
	 * Inserts user during user provisioning process
	 * 1. If user does not exist on dev instance, create the user with same sys_id and add user to AES group
	 * 2. If user already exists on dev instance, activate user and then add them to the AES group
	 * @param {Object} user
	 * @param {string} permissionType
	 * @returns {Object}
	 */
	userInsert: function(user, permissionType) {
		var userRecord = this.getUser(user.user_name, user.sys_id);
		var insertGroupResult;

		// Check to see if user currently exists:
		if (userRecord) {
			userRecord.setValue('active', true);
			userRecord.update();

			var userRecordSysID = userRecord.getUniqueValue();

			insertGroupResult = this.groupInsert(userRecordSysID, permissionType);

			return {
				insertUserResult: null,
				insertGroupResult: insertGroupResult,
				action: 'update', // Describes if user was added or updated
			};
		} else {
			throw new sn_ws_err.ServiceError()
			.setStatus(404)
			.setMessage(gs.getMessageLang("Requested user not found.", "en"))
			.setDetail(gs.getMessage("The user with the given user_name was not found."));
		}
	},

	/**
	 * Adds user to App Engine Studio Users Or App Engine Studio Users Limited group
	 * @param {string} userSysID
	 * @param {string} permissionType
	 * @returns {string}
	 */
	groupInsert: function(userSysID, permissionType) {
		var groupSysId = {
			full: CreatorStudioConstants.groups.AES_USER_GROUP_ID,
			limited: CreatorStudioConstants.groups.AES_USER_LIMITED_GROUP_ID,
		};

		var sysUserGR = new GlideRecord('sys_user_grmember');
		sysUserGR.addQuery('user', userSysID);
		sysUserGR.addQuery('group', groupSysId[permissionType]);
		sysUserGR.query();

		var insertResult = null;

		if(!sysUserGR.next()) {
			sysUserGR.user = userSysID;
			sysUserGR.group = groupSysId[permissionType];

			insertResult = sysUserGR.insert();

			if (!insertResult) {
				throw new sn_ws_err.ServiceError()
					.setStatus(500)
					.setMessage(gs.getMessageLang("Error adding user to App Engine Studio Users group", "en"))
					.setDetail(gs.getMessage("Error adding user to App Engine Studio Users group on developer instance: ", JSON.stringify(e)));
			}
		}

		return insertResult;
	},

	getUser: function(userName, sysId) {
		var sysUserGR = new GlideRecord('sys_user');
		// queries for user_name AND sys_id
		sysUserGR.addQuery('user_name', userName);
		var q1 = sysUserGR.addQuery('sys_id', sysId);
		sysUserGR.query();
		sysUserGR.next();

		// OR user_name
		q1.addOrCondition('user_name', userName);
		sysUserGR.query();
		sysUserGR.next();

		return sysUserGR.isValidRecord() ? sysUserGR : null;
	},

    type: 'AESUserIntake'
};
