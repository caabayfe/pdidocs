var CommTaskNotifyAjax = Class.create();
CommTaskNotifyAjax.prototype = (function() {
	
	/* private static methods*/
	/**
	 * Get a record by sys id
	 *
	 * @param table
	 * @param id
	 * @returns {GlideRecord}
	 * @private
	 */
	var _getRecordBySysID = function(table, id) {
		var record = new GlideRecord(table);
		if (record.get(id))
			return record;
	};
	
	/**
	 * Get a user record by sys id
	 *
	 * @param id
	 * @returns {GlideRecord}
	 * @private
	 */
	var _getUserByID = function(id) {
		return _getRecordBySysID('sys_user', id);
	};
	
	var _isUserActive = function(userId) {
		var gr = new GlideRecord("sys_user");
		return gr.get(userId) && gr.active == true;
	};
	
	/**
	 * Get all active participants for a conference call
	 *
	 * @param conferenceCallID
	 * @returns {Array} (phone numbers and user ids)
	 * @private
	 */
	var _getActiveParticipants = function(conferenceCallID) {
		var contacts = [];

		// get all active participants
		var participant = new GlideRecord('notify_participant');
		participant.addActiveQuery();
		participant.addQuery('notify_conference_call', conferenceCallID);
		participant.query();

		var notifyUtils = new global.NotifyUtil();
		// iterate over participants
		while (participant.next()) {
			var user;
			var number = participant.getValue('phone_number');
			if (participant.getValue('user')) {
				user = participant.getValue('user');
			} else {
				user = notifyUtils.getUserByNumber(number);
			}

			if (typeof user !== 'undefined')
				contacts.push(user);
			else
				contacts.push(number);
		}

		return contacts;
	};

	/**
	 * Get the (most recent) active conference call by IA ID
	 *
	 * @param commTaskID
	 * @returns {GlideRecord}
	 * @private
	 */
	var _getActiveConferenceCallForCommTask = function(commTaskID) {
		var conferenceCall = new GlideRecord('notify_conference_call');
		conferenceCall.addActiveQuery();
		conferenceCall.setLimit(1);
		conferenceCall.orderByDesc('sys_created_on');
		conferenceCall.addQuery('source', commTaskID);
		conferenceCall.query();
		if (conferenceCall.next())
			return conferenceCall;
	};

	/**
	 * Remove all the active participants from the contacts array
	 *
	 * @param source
	 * @param toRemove
	 * @returns {Array}
	 * @private
	 */
	var _removeActivePraticipantsFromContacts = function(source, toRemove) {
		var result = [];
		var arrayUtils = new global.ArrayUtil();
		for (var i = 0; i < source.length; i++) {
			var element = source[i];
			var sourceElement = (typeof element === 'object') ? element.id : element;
			if (!arrayUtils.contains(toRemove, sourceElement)) {
				result.push(element);
			}
		}
		return result;
	};

	var _validateAndGetParticipants = function(that, userID, phoneNumber, groupId) {
		var payload = that.newItem('validated');
		payload.setAttribute('user_valid', "false");
		payload.setAttribute('number_valid', "false");
		payload.setAttribute('group_valid', "false");
		var user;
		var numbers;
		var notifyUtils = new global.NotifyUtil();
		if (phoneNumber) {
			var isValidNumber = notifyUtils.validatePhoneNumber(phoneNumber);
			if (isValidNumber == true) {
				payload.setAttribute('number_valid', phoneNumber);
				user = notifyUtils.getUserByNumber(phoneNumber, true);
				if (user && _isUserActive(user.sys_id)) {
					payload.setAttribute('number_user', user.sys_id);
					payload.setAttribute('number_user_display', user.name);
				}
			}
		}

		// validate user
		if (userID) {
			if (_getUserByID(userID)) {
				numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userID], [], notifyUtils.numberType.voice);
				if (numbers.length > 0)
					payload.setAttribute('user_valid', 'true');
			}
		}

		var grpGr = new GlideRecord('sys_user_group');
		if (groupId && grpGr.get(groupId)) {
			var commPlanID = that.getParameter('sysparm_comm_plan_id') + '';
			var communicationUtil = new sn_comm_management.CommunicationManagementUtil();
			var escalatees = communicationUtil.getOnCallResourcesForConference(grpGr, commPlanID);
			if (escalatees.length > 0)
				payload.setAttribute('group_valid', 'true');
			var escalateesMap = {};
			for (var i = 0; i < escalatees.length; i++) {
				var escalatee = escalatees[i];
				if (!escalateesMap[escalatee.id]) {
					escalateesMap[escalatee.id] = true;
					// build the response payload
					var onCallpayload = that.newItem('on_call_participant');
					onCallpayload.setAttribute('name', escalatee.name);
					onCallpayload.setAttribute('color', escalatee.color);
					onCallpayload.setAttribute('sys_id', escalatee.id);
					onCallpayload.setAttribute('group_id', escalatee.groupId);
					onCallpayload.setAttribute('type', escalatee.type ? escalatee.type : '');
				}
			}
		}
	};

	var _hasAnyRole = function () {
		return gs.getUser().getRoles().length > 0;
	}

	var _isConferenceLeader = function (sourceGr) {
		var notifyUtils = new global.NotifyUtil();
		return notifyUtils.isConferenceLeader(sourceGr);
	}

	var _hasAccessToConferenceCallModal = function (sourceGr) {
		return _hasAnyRole() && _isConferenceLeader(sourceGr);
	}

	var _canReadConferenceSource = function (conferenceSysId) {
		var confGr = _getRecordBySysID('notify_conference_call', conferenceSysId);
		var sourceGr = confGr.source.getRefRecord();

		return sourceGr.canRead();
	}

	return Object.extendsObject(global.AbstractAjaxProcessor, {

	/**
	 * Get recommended participants and add them to the response payload
	 */
	getRecommendedParticipants: function() {
		var commPlanID = this.getParameter('sysparm_id') + '';
		var commTaskID = this.getParameter('sysparm_taskId') + '';
		var contacts = [];
		var activeParticipants = [];
		var grpObj = {};

		var commTaskGr = _getRecordBySysID('incident_alert_task', commTaskID);
		if (commTaskGr && !_hasAccessToConferenceCallModal(commTaskGr)) {
			return;
		}

		var channelGr = new GlideRecord("comm_channel_conference");
		channelGr.addQuery("comm_task", commTaskID);
		channelGr.query();
		channelGr.next();
		var channelType = channelGr.comm_channel_config.type;

		contacts = new sn_comm_management.CommunicationManagementUtil().getContactAccessPoints(channelGr, channelType, commTaskID);

		var notifyUtils = new global.NotifyUtil();
		var arrayUtils = new global.ArrayUtil();
		// add host to the conference call
		var host = gs.getUserID();
		var hostPresent = arrayUtils.contains(contacts, host);
		if (!hostPresent) {
			contacts = notifyUtils.appendUniquely(contacts, contacts.push(host));
		}

		// get the active conference call for this task (if any)
		var conferenceCall = _getActiveConferenceCallForCommTask(commTaskID);
		if (typeof conferenceCall !== 'undefined') {
			// get all numbers or users that are currently active
			// on this conference call
			var active = _getActiveParticipants(conferenceCall.getUniqueValue());
			contacts = _removeActivePraticipantsFromContacts(contacts, active);
		}

		// iterate over contacts and add them to the payload
		for (var i = 0; i < contacts.length; i++) {
			var contact = contacts[i];
			var additionalInformation = '';

			// check if the contact is an object
			if (typeof contact === 'object') {
				// this is an on call resource
				var level = contact.level;
				var group = contact.group;
				var grpId = contact.groupId + "";
				// set the contact to be the id
				contact = contact.id;

				// create additional information for this on call resource
				switch (level) {
					case 1:
						additionalInformation = gs.getMessage(' (1st {0})', [group]);
						break;
					case 2:
						additionalInformation = gs.getMessage(' (2nd {0})', [group]);
						break;
					case 3:
						additionalInformation = gs.getMessage(' (3rd {0})', [group]);
						break;
					default:
						additionalInformation = gs.getMessage(' ({0}th {1})', [level, group]);
				}
				grpObj[contact + ""] = grpId;
			}

			// determine to show left or right and color
			var side = (contact === host) ? 'right' : 'left';
			var color = 'black'; // default to black

			// get the user (if any)
			var user = _getUserByID(contact);
			var name = (user ? user.name : contact) + additionalInformation;

			// if it's a user, try to see if he/she has any numbers available
			if (user) {
				// lookup the voice numbers for this contact
				var numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [contact], [], notifyUtils.numberType.voice);
				if (numbers.length == 0)
					color = 'tomato'; // has no number, mark as red
			}

			// build the response payload
			var payload = this.newItem('participant');
			payload.setAttribute('side', side);
			payload.setAttribute('name', name);
			payload.setAttribute('color', color);
			payload.setAttribute('sys_id', user ? user.getUniqueValue() : contact);
		}
		var grpPayLoad = this.newItem('grpObj');
		grpPayLoad.setAttribute('grp_obj', JSON.stringify(grpObj));
	},

	/**
	 * attach Conference Call Escalation Workflow
	 */
	attachConferenceCallEscalationWorkflow: function() {
		var conferenceSysId = this.getParameter('sysparm_conference_sys_id');
		var conferenceGroups = JSON.parse(this.getParameter('sysparm_conference_groups'));
		
		if (!conferenceGroups)
			conferenceGroups = [];
		
		var conferenceCallGr = new GlideRecord('notify_conference_call');
		conferenceCallGr.addActiveQuery();
		if (conferenceCallGr.get(conferenceSysId)) {

			if (!_hasAccessToConferenceCallModal(conferenceCallGr)) {
				return;
			}

			var table = '';
			if (conferenceCallGr.table + '' == 'incident_alert_task')
				table = 'incident';
			else {
				var commChannelConferenceGr = new GlideRecord('comm_channel_conference');
				commChannelConferenceGr.addQuery('notify_conference_call', conferenceSysId);
				commChannelConferenceGr.query();
				if (commChannelConferenceGr.next()) {
					var sourceTaskGr = commChannelConferenceGr.comm_task.comm_plan.source.getRefRecord();
					table = sourceTaskGr.getRecordClassName();
				}
			}
			var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(table);
			
			var workFlowContextsGroupsInProgress = [];
			var workFlowContextsInProgressGr = new global.Workflow().getRunningFlows(conferenceCallGr);
			while (workFlowContextsInProgressGr.next()) {
				if (workFlowContextsInProgressGr.scratchpad.group && workFlowContextsInProgressGr.scratchpad.group.sys_id) {
					if (workFlowContextsGroupsInProgress.indexOf(workFlowContextsInProgressGr.scratchpad.group.sys_id) == -1)
						workFlowContextsGroupsInProgress.push(workFlowContextsInProgressGr.scratchpad.group.sys_id);
				}
			}
			
			for (var i = 0;i < conferenceGroups.length;i++) {
				var group = conferenceGroups[i];
				if (workFlowContextsGroupsInProgress.indexOf(group) == -1) {
					var inputs = {};
					inputs.group = group;
					inputs.firstremindersent = true;
					var workflowSysId = handlerInstance.getConferenceCallEscalationWorkflow(group);
					var wf = new global.Workflow();
					var wfc = wf.startFlow(workflowSysId, conferenceCallGr, conferenceCallGr.operation(), inputs);
					if (!wfc) {
						gs.warn("[attachConferenceCallEscalationWorkflow] - Failed to attach workflow context");
					}
					else {
						workFlowContextsGroupsInProgress.push(group);
					}
				}
				else {
					var groupName = '';
					var groupGr = new GlideRecord('sys_user_group');
					if (groupGr.get(group))
						groupName = groupGr.getDisplayValue();
					gs.info("[attachConferenceCallEscalationWorkflow] - conference call escalation workflow context for group " + groupName + " is already in progress.");
				}
			}
		}
	},
	
	/**
	 * Initiate a conference call
	 */
	initiateConferenceCall: function() {
		// define our AJAX XML response root node
		var payload = this.newItem('conference_call');
		payload.setAttribute('success', 'false');
		var table = this.getParameter('sysparm_table');
		var sourceTask = this.getParameter('sysparm_taskId');
		// get participants
		var commTask = _getRecordBySysID(table, sourceTask);

		if (!_hasAccessToConferenceCallModal(commTask)) {
			gs.addErrorMessage(gs.getMessage('Do not have enough permissions to initiate the conference call'));
			return;
		}

		var recordClass;
		if (commTask.getRecordClassName() === 'incident_alert_task')
			recordClass = 'incident';
		else
			recordClass = commTask.comm_plan.source.getRefRecord().getRecordClassName();
		var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(recordClass);
		var participants = this.getParameter('sysparm_participants');
		participants = participants ? participants.split(',') : [];
		var grpList = JSON.parse(this.getParameter('sysparm_group'));

		// if we have any participants, set up the conference call
		if (participants.length > 0) {
			var ccCheck = new GlideRecord('notify_conference_call');
			ccCheck.addQuery("active", true);
			ccCheck.addQuery("source", sourceTask);
			ccCheck.query();
			if (ccCheck.hasNext()) {
				gs.addErrorMessage(gs.getMessage('An active call for this task already exists. You can join the conference call after reloading the form'));
				return;
			}
			var notify = new sn_notify.NotifyScoped();
			var conferenceCall = notify.conferenceCall(commTask);
			// iterate over participants
			var success = 0;
			var groupId;
			for (var i = 0; i < participants.length; i++) {
				// and set up a call
				groupId = "";
				if (grpList[participants[i] + ''])
					groupId = grpList[participants[i] + ''];
				else {
					var gr = new GlideRecord('sys_user_grmember');
					gr.addQuery('group.active', true);
					gr.addQuery('user', participants[i] + '');
					gr.query();
					if (gr.next() && !gr.hasNext())
						groupId = gr.getValue('group');

				}
				if (this.call(participants[i] + '', conferenceCall, groupId))
					success++;
			}

			var utilObject = new sn_comm_management.CommunicationManagementUtil();
			// success?
			if (success > 0) {
				// update the payload to success and add the parameters
				payload.setAttribute('conferenceCallLink', conferenceCall.getLink());
				payload.setAttribute('conferenceCallNumber', conferenceCall.number);
				payload.setAttribute('conferenceCallSysId', conferenceCall.getUniqueValue());
				payload.setAttribute('success', 'true');
				handlerInstance.onConferenceParticipantChange(commTask, this._getParticipantsFromConference(conferenceCall.getUniqueValue()));
			} else {
				// no valid participants
				conferenceCall.setValue('active', false);
				conferenceCall.update();
				gs.addErrorMessage(gs.getMessage('You tried to initiate a conference call without any valid participants'));
			}
		}
	},

	_getParticipantsFromConference: function(conferenceCallSysId) {
		var participants = [];
		var notifyParticipantGR = new GlideRecord('notify_participant');
		notifyParticipantGR.addQuery('notify_conference_call', conferenceCallSysId);
		notifyParticipantGR.addQuery('active', false);
		notifyParticipantGR.query();
		while (notifyParticipantGR.next())
		    participants.push(notifyParticipantGR.getValue('user') || notifyParticipantGR.getValue('email'));
		return participants;
	},

	/**
	 * End the conference call
	 */
	endConference: function (confId) {

		var conferenceCallSysId = confId || this.getParameter('sysparm_conferenceId');
		var conferenceCallGr = _getRecordBySysID('notify_conference_call', conferenceCallSysId);
		if (conferenceCallGr && !_hasAccessToConferenceCallModal(conferenceCallGr)) {
			return;
		}

		var participant = new GlideRecord('notify_participant');
		participant.addQuery('active', true);
		participant.addQuery('notify_conference_call', conferenceCallSysId);
		participant.query();
		var notify = new sn_notify.NotifyScoped();
		while (participant.next()) {
			notify.kick(participant);
		}
		return true;
	},
	/**
	 * Add new participants to a conference call
	 */
	addToConferenceCall: function() {
		// define our AJAX XML response root node
		var payload = this.newItem('conference_call_participant');
		payload.setAttribute('success', 'false');

		// get participants
		var participants = this.getParameter('sysparm_participants');
		participants = participants ? participants.split(',') : [];
		// if we have any participants, set up the conference call
		if (participants.length > 0) {
			var conferenceCall = _getRecordBySysID('notify_conference_call', this.getParameter('sysparm_ccid'));
			if (!conferenceCall.active) {
				gs.addErrorMessage(gs.getMessage('The conference call you are trying to join has ended. You can initiate another one after reloading the form'));
				return;
			}

			if (!_canReadConferenceSource(conferenceCall.getUniqueValue()))
				return;
			// iterate over participants
			var success = 0;
			//remove all the active participants already in call
			var activeParticipants = _getActiveParticipants(conferenceCall.getUniqueValue());
			var arrayUtils = new global.ArrayUtil();
			for (var i = 0; i < participants.length; i++) {
				if (!arrayUtils.contains(activeParticipants, participants[i])) {
					if (this.call(participants[i] + '', conferenceCall))
						success++;
				}
			}

			// success?
			if (success > 0) {
				// update the payload to success
				payload.setAttribute('success', 'true');
				payload.setAttribute('conferenceCallSysId', this.getParameter('sysparm_ccid'));
				var commTask = conferenceCall.source.getRefRecord();
				var recordClass;
				if (commTask.getRecordClassName() === 'incident_alert_task')
					recordClass = 'incident';
				else
					recordClass = commTask.comm_plan.source.getRefRecord().getRecordClassName();
				var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(recordClass);
				var conferenceParticipants = this._getParticipantsFromConference(conferenceCall.getUniqueValue());
				participants = participants.filter(function(participant) {
					return conferenceParticipants.indexOf(participant) != -1;
				});
				handlerInstance.onConferenceParticipantChange(commTask, participants);
			} else {
				gs.addErrorMessage(gs.getMessage('You tried to add invalid participants to the conference call'));
			}
		}
	},

	/**
	 * Validate a phone number and / or a user id
	 */
	validateUserOrNumber: function () {
		if (!_hasAnyRole())
			return;
		// get parameters
		var userID = this.getParameter('sysparm_user_id');
		var phoneNumber = this.getParameter('sysparm_number');
		_validateAndGetParticipants(this, userID, phoneNumber);
	},

	/**
	 * Validate a phone number/user/group and get the on call participants for the group
	 */
	validateAndGetParticipants: function () {
		if (!_hasAnyRole())
			return;
		// get parameters
		var userID = this.getParameter('sysparm_user_id');
		var phoneNumber = this.getParameter('sysparm_number');
		var groupId = this.getParameter('sysparm_group_id');
		_validateAndGetParticipants(this, userID, phoneNumber, groupId);
	},

	getPhoneNumber: function (userId) {
		var user = _getUserByID(userId);
		var to = '';
		var notifyUtils = new global.NotifyUtil();

		if (user) {
			var numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userId], [], notifyUtils.numberType.voice);
			if (numbers.length > 0)
				to = numbers[0];
		}
		return to;
	},

	/**
	 * Add a participant into a conference call
	 *
	 * @param participant
	 * @param {NotifyConferenceCallGR} conferenceCall
	 * @returns {boolean}
	 * @private
	 */
	call: function (participant, conferenceCall, groupId) {
		var commTask = conferenceCall.source.getRefRecord();

		if (!commTask.canRead()) {
			gs.addErrorMessage(gs.getMessage('Do not have enough permissions to make a call'));
			return false;
		}
		var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(commTask.comm_plan.source.getRefRecord().getRecordClassName());
		/**
		 * @type {SysUserGR}
		 */
		var user = _getUserByID(participant);
		var to = this.getPhoneNumber(participant);
		var notifyUtils = new global.NotifyUtil();
		// define the number to call
		if (!to) {
			// participant is a user
			to = participant;
		}

		// got a number?
		if (to) {
			if (typeof global.NotifyConferenceUtils == 'undefined') {
				var NOTIFY_NUMBER = handlerInstance.PROPERTIES.NOTIFY_NUMBER;
				var from = gs.getProperty(NOTIFY_NUMBER, '').trim();
				// got a from number?
				if (!from) {
					gs.addErrorMessage(gs.getMessage('Configure the notify number property to contain the Notify number to be used'));
					return false;
				}
				var notify = new sn_notify.NotifyScoped();
				notify.call(from, to, conferenceCall, (!user ? null : user.getUniqueValue()), (!groupId ? null : groupId));
				return true;
			} else {
				var confUtils = new global.NotifyConferenceUtils();
				// add to conference call
				var data = confUtils.getConferenceInputDataTemplate();
				data.confId = conferenceCall.getUniqueValue();
				data.serviceProvider = conferenceCall.service_provider + '';
				var item = {
					phoneNumber: to,
					email: '',
					id: '',
					groupId: ''
				};
				if (user) {
					item.id = user.getUniqueValue();
					item.email = user.email + '';
				}
				if (groupId)
					item.groupId = groupId;

				data.items.push(item);
				var actionResult = confUtils.doConferenceAction('multiJoin', data);
				return actionResult.status;
			}
		} else {
			gs.addErrorMessage(gs.getMessage('participant {0} could not be added to conference call {1}', [(user ? user.name : participant), conferenceCall.getValue('number')]));
			return false;
		}
	},
		
	addCurrentUserToCall: function () {
		var callID = this.getParameter('sysparm_call_id');

		if (!_canReadConferenceSource(callID))
			return '';

		var participant = new GlideRecord('notify_participant');
		participant.addQuery('active', true);
		participant.addQuery('notify_conference_call', callID);
		participant.query();
		var participantArray = [];
		while(participant.next())
			participantArray.push(participant.user + '');
		return participantArray.join();
	},

	type: 'CommTaskNotifyAjax'
});

})();
