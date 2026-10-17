/**
	 * @typedef {{
				serviceProvider?: string,
				table: string,
				sysId: string,
				confId?: string,
				groupId?: string,
				userId?: string,
				phoneNumber?: string,
				email?: string,
				addToWorkNotes?: boolean,
				allowMulticonference?: boolean,
				isSMS?: boolean,
				numbersType?: string,
				message?: string,
				isNewConference?: boolean,
				num:number,
				fromNumber?: string,
				items?: Array<{
					notifyParticipantId?: string,
					groupId?: string,
					id: string,
					name: string,
					phoneNumber?: string,
					email?: string,
					active?: boolean,
					users?:Array<{notifyParticipantId?:string, id: string, name?: string, phoneNumber?: string, email?: string, active?: boolean}>
				}>
			}} ConferenceInputData
	*/
var NotifyOnTaskAjaxProcessorSNC_V2 = Class.create();
NotifyOnTaskAjaxProcessorSNC_V2.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	TABLE: {
		CONF: 'notify_conference_call',
		PARTICIPANT_SESSION: 'notify_participant_session',
		NUMBER: 'notify_number',

		PARTICIPANT: 'notify_participant'
	},

	EVENT_CONFERENCE_MODIFIED: "conference.modified",
	EVENT_CONFERENCE_INITIATED: "conference.initiated",
	ASYNC_CONF_FLOW_ACTION: "global.notify_process_conference_async_action",
	
	/**
	 * @param {ConferenceInputData} data
	*/
	initialize: function (request, responseXML, gc, data) {
		global.AbstractAjaxProcessor.prototype.initialize.apply(this, arguments);
		this.notifyUtils = new global.NotifyUtil();
		if (request) {
			/**
			 * @type {string}
			 */
			var parmData = this.getParameter('sysparm_data');
			try {
				data = JSON.parse(parmData);
			} catch (e) {
				gs.error("Could not parse sysparm_data = " + parmData);
			}
		} else {
			if (typeof data == 'string') {
				try {
					data = JSON.parse(data);
				} catch (e) {
					gs.error("Could not parse data = " + data);
				}
			}
		}

		/**
		* @type {ConferenceInputData}
		*/
		this.data = data || /**@type {ConferenceInputData} */({});
		// same function will be called so "!!this.data.isNewConference" will not work
		if (typeof (this.data.isNewConference) == 'undefined')
			this.data.isNewConference = !this.data.confId;
		var hasValidTableData = !!this.data.table && !!this.data.sysId;
		if (!hasValidTableData) {
			if (this.data.confId) {
				var conferenceCallGr = /** @type {NotifyConferenceCallGR}*/(new GlideRecord(this.TABLE.CONF));
				if (conferenceCallGr.get(this.data.confId)) {
					data.table = this.data.table = conferenceCallGr.table + '';
					data.sysId = this.data.sysId = conferenceCallGr.source + '';
				}
			}
		}
		this._result = { status: false, errorMessages: [], warnMessages: [], successMessages: [] };
		if (!this.data.numbersType)
			this.data.numbersType = this.data.isSMS ? this.notifyUtils.numberType.sms : this.notifyUtils.numberType.voice;
	},
	/**
	 * @type {global.NotifyUtil}
	 */
	notifyUtils: null,
/**
 * @type {ConferenceInputData}
*/
	data: null,
	_result: null,
	process: function () {
		if (!gs.getUser().hasRoles())
			return;

		var isConfLeader = false;
		if (this.data.confId) {
			var confCallGr = new GlideRecord('notify_conference_call');
			if (confCallGr.get(this.data.confId))
				isConfLeader = this.notifyUtils.isConferenceLeader(confCallGr);
		} else if (this.data.table && this.data.sysId) {
			var sourceGr = new GlideRecord(this.data.table);
			if (sourceGr.get(this.data.sysId))
				isConfLeader = this.notifyUtils.isConferenceLeader(sourceGr);
		}
		if (!isConfLeader)
			return;

		return global.AbstractAjaxProcessor.prototype.process.apply(this, arguments);
	},

	_appendErrorMessages: function (errs) {
		this._result.errorMessages = this._result.errorMessages.concat(errs);
	},

	_updateFinalStatus: function (status) {
		this._result.status = status;
	},

	_addErrorMessage: function (message) {
		this._result.errorMessages.push(message);
	},

	_addWarnMessage: function (message) {
		this._result.warnMessages.push(message);
	},

	_addSuccessMessage: function (message) {
		this._result.successMessages.push(message);
	},

	/**
	 * @returns {Array<any>}
	*/
	_getContacts: function () {
		this.notifyUtils.resetResult();
		var contacts = this.notifyUtils.getConferenceContacts(this.data.table, this.data.sysId, this.data.numbersType);
		var result = this.notifyUtils.getResult();
		if (!result.status)
			this._appendErrorMessages(result.errorMessages);
		return contacts;
	},

	/**
	 * @param  {Array<{id: string, phoneNumber?: string, showGroupName?: boolean, users?: Array<{id: string, phoneNumber: string}>}>} source
	 * @param  {Array<{id: string, phoneNumber?: string, showGroupName?: boolean, users?: Array<{id: string, phoneNumber: string}>}>} toBeRemoved
	 */
	_removeActivePraticipantsFromContacts: function (source, toBeRemoved) {
		var result = [];
		var uniqueItems = {};
		var i;
		var j;
		for (i = 0; i < toBeRemoved.length; i++) {
			if (!!toBeRemoved[i].users && toBeRemoved[i].users.length > 0) {
				var users = toBeRemoved[i].users;
				for (j = 0; j < users.length; j++) {
					uniqueItems[users[j].id] = true;
					if (users[j].phoneNumber)
						uniqueItems[users[j].phoneNumber] = true;
				}
			} else {
				uniqueItems[toBeRemoved[i].id] = true;
				if (toBeRemoved[i].phoneNumber)
					uniqueItems[toBeRemoved[i].phoneNumber] = true;
			}
		}
		for (i = 0; i < source.length; i++) {
			var item = source[i];
			if (item.users && item.users.length > 0) {
				if (item.showGroupName) {
					result.push(item);
					continue;
				}
				for (j = 0; j < item.users.length;) {
					var userItem = item.users[j];
					if (uniqueItems[userItem.id] || uniqueItems[userItem.phoneNumber]) {
						item.users.splice(j, 1);
						continue;
					}
					j++;
				}
				if (item.users.length > 0)
					result.push(item);
			} else {
				if (!(uniqueItems[item.id] || uniqueItems[item.phoneNumber]))
					result.push(item);
			}
		}
		return result;
	},
	jsonRoot: null,
	newItem: function (key) {
		if (!!this.responseXML && !!this.request)
			return AbstractAjaxProcessor.prototype.newItem.call(this, key);
		if (!this.jsonRoot)
			this.jsonRoot = {};
		var jsonRoot = this.jsonRoot;
		var targetOb = {};
		if (jsonRoot[key]) {
			if (!Array.isArray(jsonRoot[key])) {
				var oldValue = jsonRoot[key];
				jsonRoot[key] = [];
				jsonRoot[key].push(oldValue);
			}
			this.jsonRoot[key].push(targetOb);
		} else {
			this.jsonRoot[key] = targetOb;
		}

		return {
			setAttribute: function (name, value) {
				targetOb[name] = value;
			}
		};
	},
	/**
	 * @param {string} table
	 * @param {string} id
	 * @returns {GlideRecord & RecordMetaInfo}
	*/
	_getRecordBySysID: function (table, id) {
		var record = new GlideRecord(table);
		if (record.get(id))
			return record;
	},
	/**
	 * @param {string} id
	 * @returns {SysUserGR}
	*/
	_getUserByID: function (id) {
		return /**@type {SysUserGR} */(this._getRecordBySysID('sys_user', id));
	},
	/**
	 * @param {Array<{name?: string, id?: string, phoneNumber?: string, email?: string} & {users?: Array<{name?: string, id?: string, phoneNumber?: string, email?: string}>}>} Items
	 */
	fixEmails: function (Items) {
		if (!Array.isArray(Items) || Items.length === 0)
			return [];
		var self = this;
		/**
		 * @type {Object.<string, Array<{name?: string, id?: string, phoneNumber?: string, email?: string}>>}
		 */
		var idToItemMap = {};
		/**
		 * @param {{id: string, email: string}} userItem
		 */
		function addToMap(userItem) {
			if (!userItem)
				return;
			if(typeof userItem.email !== 'string' || userItem.email.length === 0)
				userItem.email = '';
			if (typeof userItem.id !== 'string' || userItem.id.length === 0)
				return;
			if (!idToItemMap[userItem.id])
				idToItemMap[userItem.id] = [];
			idToItemMap[userItem.id].push(userItem);
		}
		Items.forEach(function (thisContact) {
			if (Array.isArray(thisContact.users)) {
				thisContact.users.forEach(function (userItem) {
					addToMap(userItem);
				});
				return;
			}
			addToMap(thisContact);
		});
		var userIds = Object.keys(idToItemMap);
		if (userIds.length === 0)
			return;
		var gr = new GlideRecord('sys_user');
		gr.addActiveQuery();
		gr.addQuery('sys_id', 'IN', userIds);
		gr.addNotNullQuery('email');
		gr.query();
		while (gr.next()) {
			idToItemMap[gr.getUniqueValue()].forEach(function (thisUserItem) {
				thisUserItem.email = gr.getValue('email');
			});
		}
		return Items;
	},

	getRecommendedParticipants: function () {
		var confUtils = new NotifyConferenceUtils();
		/**
		 * @typedef {{name?: string, id?: string, phoneNumber?: string, email?: string}} Item
		 * @type {Array<Item & {users?:Array<Item>}>}
		*/
		var contacts = this._getContacts();
		var host = gs.getUserID();
		var hostPresent = false;
		for (var i = 0; i < contacts.length; i++) {
			if (!!contacts[i].users && contacts[i].users.length > 0) {
				for (var j = 0; j < contacts[i].users.length; j++) {
					if (contacts[i].users[j].id == host) {
						hostPresent = true;
						break;
					}
				}
			} else {
				if (contacts[i].id == host) {
					hostPresent = true;
					break;
				}
			}
		}
		if (!hostPresent) {
			var numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [host], [], this.data.numbersType);
			contacts.push({
				name: gs.getUserDisplayName(),
				id: host,
				phoneNumber: numbers.length > 0 ? numbers[0] : ''
			});
		}
		contacts = this.notifyUtils.filterDuplicateContacts(contacts);
		if (this.data.confId) {
			var conferenceCallGr = this._getActiveConferenceCallForTask(this.data.sysId);
			if (conferenceCallGr) {
				var active = confUtils.getActiveParticipants(conferenceCallGr.getUniqueValue());
				contacts = this._removeActivePraticipantsFromContacts(contacts, active);
			}
		}
		contacts = this.fixEmails(contacts);
		return JSON.stringify(contacts);
	},

	_getActiveConferenceCallForTask: function (taskId) {
		var conferenceCall = /**@type {NotifyConferenceCallGR} */(new GlideRecord(this.TABLE.CONF));
		conferenceCall.addActiveQuery();
		conferenceCall.setLimit(1);
		conferenceCall.orderByDesc('sys_created_on');
		conferenceCall.addQuery('source', taskId);
		conferenceCall.query();
		if (conferenceCall.next())
			return conferenceCall;
	},
	/**
	 * @param {GlideRecord} sourceGr
	 * @returns {string|null}
	 */
	_getNotifyNumber: function (sourceGr) {
		this.notifyUtils.resetResult();
		var notifyNumber = this.notifyUtils.getNotifyNumber(sourceGr.getTableName(), sourceGr.getUniqueValue());
		var result = this.notifyUtils.getResult();
		if (!result.status)
			this._appendErrorMessages(result.errorMessages);
		return notifyNumber;
	},
	getFinalStatus: function () {
		this._result.inputData = this.data;
		return JSON.stringify(this._result);
	},

	addToConferenceCall: function () {
		var confObj = ConferenceFactory.createConferenceInstance(this.data.serviceProvider || 'Telephony');
		var result = confObj.addToConferenceFromData(this.data);
		if(result.status)
			this._onConferenceParticipantsChanged(confObj.getConferenceGR());
		return JSON.stringify(result);
	},

	addToConferenceCallAsync: function () {
		var result = {};
		if (!this.data.items) return JSON.stringify(result);
		if (!Array.isArray(this.data.items)) return JSON.stringify(result);
		var items = this.data.items || [];
		var confObj = ConferenceFactory.createConferenceInstance(this.data.serviceProvider || 'Telephony');
		var confUtils = new NotifyConferenceUtils();
		var syncBatchCount = confUtils.getDefaultAsyncBatchThresholdLimit();
		if (confUtils.canStartAsyncAction(this.data)){
			var firstHalf = items.slice(0, syncBatchCount);
			var secondHalf = items.slice(syncBatchCount, items.length);
			this.data.items = firstHalf;
			result = confObj.addToConferenceFromData(this.data);
			//Reset the data for add participants
			var confData = {};
			for (var key in this.data){
				confData[key] = this.data[key];
			}
			confData.items = secondHalf;
			if (result.status){
				//Invoke Flow Action for async execution
				var payload = {
					"conferencedata": JSON.stringify(confData),
					"action": confUtils.ACTION.MULTI_JOIN
				};
				sn_fd.FlowAPI.startAction(this.ASYNC_CONF_FLOW_ACTION, payload);
				var messages = result.successMessages || [];
				messages.push(gs.getMessage("Since the number of added participants in this call exceed {0}, system would process the participant addition in  background. This operation is done so that you can continue to operate on the record.", syncBatchCount));
				result.successMessages = messages;
			}
		}
		else {
			result = confObj.addToConferenceFromData(this.data);
		}
		if(result.status) {
			this._onConferenceParticipantsChanged(confObj.getConferenceGR());
		}	
		return JSON.stringify(result);
	},

	initiateConferenceCall: function () {
		var confObj = ConferenceFactory.createConferenceInstance(this.data.serviceProvider || 'Telephony');
		var result = confObj.startConferenceFromData(this.data);
		if(result.status) {
			this._onConferenceCallInitiated(confObj.getConferenceGR());
			this._onConferenceParticipantsChanged(confObj.getConferenceGR());
		}	
		return JSON.stringify(result);
	},

	initiateConferenceCallAsync: function () {
		var result = {};
		if (!this.data.items) return JSON.stringify(result);
		if (!Array.isArray(this.data.items)) return JSON.stringify(result);
		var items = this.data.items || [];
		var confObj = ConferenceFactory.createConferenceInstance(this.data.serviceProvider || 'Telephony');
		var confUtils = new NotifyConferenceUtils();
		var syncBatchCount = confUtils.getDefaultAsyncBatchThresholdLimit();
		if (confUtils.canStartAsyncAction(this.data)){
			var firstHalf = items.slice(0, syncBatchCount);
			var secondHalf = items.slice(syncBatchCount, items.length);
			this.data.items = firstHalf;
			result = confObj.startConferenceFromData(this.data);
			if (result.status && result.details.conferenceCallSysId){
				//Reset the data for add participants
				var confData = {};
				for (var key in this.data){
					confData[key] = this.data[key];
				}
				confData.items = secondHalf;
				confData.table = "";
				confData.sysId = "";
				confData.confId = result.details.conferenceCallSysId;
				confData.isNewConference = false;
				//Invoke Flow Action for async execution
				var payload = {
					"conferencedata": JSON.stringify(confData),
					"action": confUtils.ACTION.MULTI_JOIN
				};
				sn_fd.FlowAPI.startAction(this.ASYNC_CONF_FLOW_ACTION, payload);
				if (result.successMessages){
					result.successMessages.push(gs.getMessage("The conference call has been initiated and a few additional participants will be added to the conference call soon in background, this enables you to continue work without any interruption."));
				}
			}
		}
		else {
			result = confObj.startConferenceFromData(this.data);
		}
		if(result.status) {
			this._onConferenceCallInitiated(confObj.getConferenceGR());
			this._onConferenceParticipantsChanged(confObj.getConferenceGR());
		}	
		return JSON.stringify(result);
	},
	
	/**
	* @param {NotifyConferenceCallGR} confGr
	*/
	_onConferenceCallInitiated: function (confGr) {
		//we are doing this with conf gr because event processor code sometimes runs into errors when we pass scoped gliderecord.
		if (typeof confGr.isScopedObject === 'function' && confGr.isScopedObject()) {
			var gr = new GlideRecord('notify_conference_call');
			if (gr.get(confGr.getUniqueValue()))
				confGr = gr;
		}
		this.data.confId = confGr.sys_id + '';
		gs.eventQueue(this.EVENT_CONFERENCE_INITIATED, confGr, JSON.stringify(this.data), "");
	},

	/**
	 * @param {NotifyConferenceCallGR} confGr
	*/
	_onConferenceParticipantsChanged: function (confGr) {
		if (typeof confGr.isScopedObject === 'function' && confGr.isScopedObject()) {
			var gr = new GlideRecord('notify_conference_call');
			if (gr.get(confGr.getUniqueValue()))
				confGr = gr;
		}
		this.data.confId = confGr.sys_id + '';
		gs.eventQueue(this.EVENT_CONFERENCE_MODIFIED, confGr, JSON.stringify(this.data), "");
	},

	/**
	 * @param {string} phoneNumber
	 * @returns {boolean}
	 */
	_isValidPhoneNumber: function (phoneNumber) {
		if (typeof phoneNumber != 'string')
			return false;
		if (phoneNumber.length == 0)
			return false;
		return this.notifyUtils.validatePhoneNumber(phoneNumber);
	},
	
	_getUserLabel: function (tableName, userName) {
		if (!tableName || !userName)
			return '';
		
		var taskGr = new GlideRecord(tableName + '');
		taskGr.get(this.data.sysId + '');
		var fields = taskGr.getFields();
		for (var i = 0; i < fields.size(); i++) {
			var field = fields.get(i);
			if (field && field.getDisplayValue() === userName + '')
				return field.getLabel();
		}
		return '';
	},
	
	
	/**
	 * @param {string} userId - sysUser id
	 * @param {string} phoneNumbr - E.164 compatible phone number
	 * @param {string} email - email mapped to sys_user record
	 * @param {string} groupId
	 * @param {string} tableName
	 * @param {string} tableSysId
	 * @param {string} confId
	 */
	_validateAndGetParticipants: function (userId, phoneNumber, email, groupId, tableName, tableSysId, confId) {
		/**
		 * @type {Array<string>}
		 */
		var numbers = [];
		var result = [];
		/**
		* @type {SysUserGR | null}
		*/
		var userGr;
		var confUtils = new NotifyConferenceUtils();

		if (typeof phoneNumber == 'string' && phoneNumber.length > 0) {
			var isValidNumber = this._isValidPhoneNumber(phoneNumber);
			var phoneNumberItem = {
				name: '',
				id: phoneNumber,
				phoneNumber: phoneNumber,
				isValidNumber: !!isValidNumber,
				email: '',
				active: false
			};

			result.push(phoneNumberItem);
			if (isValidNumber) {
				userGr = this.notifyUtils.getUserByNumber(phoneNumber, true, this.data.numbersType);
				if (userGr && userGr.active) {
					var phoneUserLabel = this._getUserLabel(tableName, userGr.getDisplayValue());
					if (phoneUserLabel)
						phoneNumberItem.name = gs.getMessage("{0} ({1})", [userGr.getDisplayValue(), phoneUserLabel]);
					else
						phoneNumberItem.name = userGr.getDisplayValue();
					phoneNumberItem.id = userGr.getUniqueValue();
					phoneNumberItem.phoneNumber = phoneNumber;
					if (!userGr.email.nil())
						phoneNumberItem.email = userGr.email + '';
					phoneNumberItem.active = false;
					if (confId)
						phoneNumberItem.active = this.notifyUtils.isParticipantSessionActive(userGr.getUniqueValue(), confId);
				} else {
					phoneNumberItem.name = phoneNumber;
					phoneNumberItem.id = phoneNumber;
					phoneNumberItem.phoneNumber = phoneNumber;
					phoneNumberItem.active = false;
					if (confId)
						phoneNumberItem.active = this.notifyUtils.isParticipantSessionActiveForPhoneNumber(phoneNumber, confId);
				}
			}
		}

		// validate user
		if (typeof userId == 'string' && userId.length > 0) {
			var userItem = {
				name: '',
				id: userId,
				phoneNumber: '',
				email: ''
			};
			result.push(userItem);
			userGr = this._getUserByID(userId);
			if (userGr) {
				userItem.id = userId;
				userItem.name = userGr.getDisplayValue();
				numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userId], [], this.data.numbersType);
				userItem.phoneNumber = numbers.length > 0 ? numbers[0] : '';
				userItem.active = false;
				if (!userGr.email.nil())
					userItem.email = userGr.email + '';

				if (confId)
					userItem.active = this.notifyUtils.isParticipantSessionActive(userGr.getUniqueValue(), confId);
			}
		}
		if (typeof email == 'string' && email.length > 0) {
			var emailItem = {
				name: email,
				id: '',
				phoneNumber: '',
				email: email,
				active: false,
				isValidEmail: false
			};
			result.push(emailItem);
			/**
			 * @type {Array<string>}
			 */
			var validationResult = SNC.EmailAddressValidator.validate(email);
			if (validationResult.length == 0) {
				emailItem.isValidEmail = true;
			} else {
				this._addErrorMessage(validationResult[0]);
			}
			var userFromMail = GlideUser.getUserByEmail(email);
			if (userFromMail) {
				var emailUserLabel = this._getUserLabel(tableName, userFromMail.getDisplayName());
				if (emailUserLabel)
					emailItem.name = gs.getMessage("{0} ({1})", [userFromMail.getDisplayName(), emailUserLabel]);
				else
					emailItem.name = userFromMail.getDisplayName();
				emailItem.id = userFromMail.getID() + ''; // returning as 'Object'
				numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [emailItem.id], [], this.data.numbersType);
				if (numbers.length > 0)
					emailItem.phoneNumber = numbers[0];
				if (confId)
					emailItem.active = this.notifyUtils.isParticipantSessionActive(emailItem.id, confId);
			}
		}
		if (!groupId)
			return JSON.stringify(this.notifyUtils.filterDuplicateContacts(result));

		var grpGr = this._getRecordBySysID("sys_user_group", groupId);
		if (grpGr) {
			var grpName = grpGr.getDisplayValue();

			this.notifyUtils.resetResult();
			var grpDetails = this.notifyUtils.getConferenceGroupDetails(groupId, this.data.table, this.data.sysId, this.data.numbersType, undefined);
			var res = this.notifyUtils.getResult();

			if (!res.status) {
				this._appendErrorMessages(res.errorMessages);
				result.push({ id: groupId, users: [] });
			} else {
				grpDetails.users = this.fixEmails(grpDetails.users);
				if (grpDetails && grpDetails.users && grpDetails.users.length > 0 && confId && !grpDetails.showGroupName) {
					var activeParticipants = confUtils.getActiveParticipants(confId);
					grpDetails.users = this._removeActivePraticipantsFromContacts(grpDetails.users, activeParticipants);
				}
				grpDetails.id = groupId;
				if (!grpDetails.name)
					grpDetails.name = grpName;

				result.push(grpDetails);
			}
		}
		return JSON.stringify(this.notifyUtils.filterDuplicateContacts(result));
	},

	validateAndGetParticipants: function () {
		return this._validateAndGetParticipants(this.data.userId, this.data.phoneNumber,this.data.email, this.data.groupId, this.data.table, this.data.sysId, this.data.confId) || this.jsonRoot;
	},

	endConference: function () {
		if (!this.data.confId) {
			this._addErrorMessage(gs.getMessage("Invalid conference record sent"));
			return this.getFinalStatus();
		}

		var confGR = /**@type {NotifyConferenceCallGR} */(new GlideRecord(this.TABLE.CONF));
		if (!confGR.get(this.data.confId)) {
			this._addErrorMessage(gs.getMessage('Given conference record not found'));
			return this.getFinalStatus();
		}
		if (!confGR.active) {
			this._addErrorMessage(gs.getMessage("The conference call you are trying to end has already ended. Please reload the page"));
			return this.getFinalStatus();
		}
		var confObj = ConferenceFactory.createConferenceObjectFromConferenceGR(confGR);
		var result = confObj.endConference();
		if (result.status)
			result.successMessages.push(gs.getMessage("The conference call {0} has been ended", confGR.number));
		return JSON.stringify(result);
	},

	onConference: function () {
		if (!this.data.addToWorkNotes)
			return;
		if (!Array.isArray(this.data.items))
			return;
		if (!this.data.confId)
			return;
		var conferenceCallGr = /** @type {NotifyConferenceCallGR}*/(new GlideRecord(this.TABLE.CONF));
		if (!conferenceCallGr.get(this.data.confId))
			return;
		var confNumber = conferenceCallGr.number + '';
		var friendlyNames = [];
		var adHocNumbers = [];
		var unknownName = gs.getMessage('unknown');
		/**
		 * @param {{notifyParticipantId?: string, name: string, id: string, phoneNumber?: string, active?: string}} item
		 */
		function addToList(item) {
			if (!item.active)
				return;
			if (item.id == item.phoneNumber)
				adHocNumbers.push(item.phoneNumber);
			else
				friendlyNames.push(item.name.length == 0 ? unknownName : item.name);
		}

		for (var i = 0; i < this.data.items.length; i++) {
			if (Array.isArray(this.data.items[i].users)) {
				if (this.data.items[i].users.length == 0)
					continue;
				for (var j = 0; j < this.data.items[i].users.length; j++) {
					if (!this.data.items[i].users[j].active)
						continue;
					addToList(this.data.items[i].users[j]);
				}
			} else {
				if (this.data.items[i].active)
					addToList(this.data.items[i]);
			}
		}
		var msg = '';
		
		if (this.data.isNewConference) {
			if (adHocNumbers.length == 0)
				msg = gs.getMessage("Notify conference call {0} was started.\nParticipants: {1}", [confNumber, friendlyNames.join(",")]);
			else
				msg = gs.getMessage("Notify conference call {0} was started.\nParticipants: {1}\nEntered Number: {2}", [confNumber, friendlyNames.join(","), adHocNumbers.join(',')]);
		} else {
			if (adHocNumbers.length == 0)
				msg = gs.getMessage("New participants were added to conference {0}.\nParticipants: {1}", [confNumber, friendlyNames.join(",")]);
			else
				msg = gs.getMessage("New participants were added to conference {0}.\nParticipants: {1}\nEntered Number: {2}", [confNumber, friendlyNames.join(","), adHocNumbers.join(',')]);
		}
		if (!(this.data.table && this.data.sysId)) {
			gs.error("unable to update the worknotes due to wrong data tableName {0} sysId {1}", [this.data.table, this.data.sysId]);
			return;
		}

		var taskGr = /**@type {TaskGR} */(new GlideRecord(this.data.table));
		if (!taskGr.get(this.data.sysId)) {
			gs.error("unable to get the record and update the worknotes due to wrong data tableName {0} sysId {1}", [this.data.table, this.data.sysId]);
			return;
		}
		if (taskGr.isValidField('work_notes')) {
			taskGr.work_notes = msg;
			taskGr.update();
		}
	},

	isConferenceActive: function () {
		if (!this.data.confId) {
			this._addErrorMessage(gs.getMessage("Invalid conference record sent"));
			return this.getFinalStatus();
		}

		var confGr = /**@type {NotifyConferenceCallGR} */(new GlideRecord(this.TABLE.CONF));
		if (!confGr.get(this.data.confId)) {
			this._addErrorMessage(gs.getMessage('Given conference record not found'));
			return this.getFinalStatus();
		}
		if (!confGr.active)
			this._addErrorMessage(gs.getMessage("The conference call you are trying to open has ended. Please reload the page"));
		this._updateFinalStatus(!!confGr.active);
		return this.getFinalStatus();
	},

	getFinalResult: function () {
		return this._result;
	},

	_isVoiceCapableNumber: function (number) {
		return this.notifyUtils.isVoiceCapableNumber(number);
	},

	sendSms: function () {
		if (!this.data) {
			this._addErrorMessage(gs.getMessage("Wrong input data "));
			return this.getFinalStatus();
		}
		if (!this.data.items) {
			this._addErrorMessage(gs.getMessage("Input doesn't have valid participant data"));
			return this.getFinalStatus();
		}
		if (!Array.isArray(this.data.items)) {
			this._addErrorMessage(gs.getMessage("Participant data must be an array"));
			return this.getFinalStatus();
		}

		if (!(!!this.data.table && !!this.data.sysId)) {
			this._addErrorMessage(gs.getMessage("table name or sysId is wrong"));
			return this.getFinalStatus();
		}

		if (!this.data.message) {
			this._addErrorMessage(gs.getMessage("No text message to send"));
			return this.getFinalStatus();
		}
		try {
			var processResult = this._processSMS(this.data.message.trim());
		} catch (e) {
			this._updateFinalStatus(false);
			this._addErrorMessage(gs.getMessage("An error occurred sending the SMS. ({0})", [e]));
		}
		if (processResult && processResult.successfulRecipients)
			this._updateFinalStatus(true);
		else
			this._updateFinalStatus(false);
		return this.getFinalStatus();
	},

	_addWorkNoteMessageForSMS: function(task, friendlyNames, message) {
		if (task.isValidField('work_notes')) { 
			var worknotes = gs.getMessage("SMS was sent.\nRecipients: {0}\nMessage: {1}", [friendlyNames.join(", "), message]);
			task.work_notes = worknotes;
			task.update();
		}
    },
	
	_processSMS: function (message) {
		var that = this;
		var sentMessages = 0;
		var numbers = this.data.items;
		var idMap = {};
		var smsed = [];
		var friendlyUserNames = [];
		var sourceGr = this._getRecordBySysID(this.data.table, this.data.sysId);
		if (!sourceGr) {
			this._addErrorMessage(gs.getMessage('Invalid source record'));
			return { successfulRecipients: sentMessages };
		}

		// get notify number
		var notifyNumber = null;
		try {
			if (this.data.fromNumber)
				notifyNumber = this.data.fromNumber;
			else
				notifyNumber = this._getNotifyNumber(sourceGr);
			this.notifyUtils.validateOutboundNotifyPhoneNumber_throws(notifyNumber);
		} catch (e) {
			this._addErrorMessage(gs.getMessage('Could not send SMS message(s) ({0})', [e]));
			numbers = [];
		}

		//validate if the notify number is sms capable
		if (!this._isSmsCapableNumber(notifyNumber)) {
			this._addErrorMessage(gs.getMessage('Number {0} is not sms capable', notifyNumber));
			return { successfulRecipients: sentMessages };
		}

		//validate the recipients
		for (var i = 0; i < numbers.length; i++) {
			var p = numbers[i];
			if (p && p.phoneNumber.length == 0) {
				this._addErrorMessage(gs.getMessage("{0} has empty phone number", [p.id]));
				continue;
			}
			if (!this._isValidPhoneNumber(p.phoneNumber)) {
				if (p.name)
					this._addErrorMessage(gs.getMessage("Invalid phone number found for participant {0}", p.name));
				else
					this._addErrorMessage(gs.getMessage("{0} is invalid phone number", p.phoneNumber));
				continue;
			}
			if (p.phoneNumber && !idMap[p.phoneNumber]) {
				sentMessages++;
				idMap[p.phoneNumber] = true;
				smsed.push(p.phoneNumber);
				friendlyUserNames.push(p.name);
			}
		}
		var notifyApi = new SNC.Notify();
		notifyApi.sendBulkSMS(notifyNumber, smsed, message, sourceGr);
		if (notifyApi.hasErrors()) {
			j2js(notifyApi.getErrors()).forEach(function (e) {
				that._addErrorMessage(e);
			});
			sentMessages = 0;
		}

		if (sentMessages > 0) {
			this._addSuccessMessage(gs.getMessage("Message was sent to {0} recipient(s)", [sentMessages + '']));
			if(this.data.addToWorkNotes)
				this._addWorkNoteMessageForSMS(sourceGr, friendlyUserNames, message);
		}
		return { successfulRecipients: sentMessages };
	},

	_isSmsCapableNumber: function (number) {
		var numberGr = new GlideRecord("notify_number");
		numberGr.addActiveQuery();
		numberGr.addQuery("number", number);
		numberGr.addQuery("has_sms_out", "IN", "yes,unknown");
		numberGr.query();
		if (!numberGr.hasNext())
			return false;
		return true;
	},
	type: 'NotifyOnTaskAjaxProcessorSNC_V2'
});
