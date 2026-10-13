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

var ConferenceParticipantsTCM = Class.create();
ConferenceParticipantsTCM.prototype = {
    initialize: function() {},
    /**
     * @param {ConfInputData} inputData
     */
    onConference: function(inputData) {
        if (typeof inputData == 'string') {
            try {
                inputData = JSON.parse(inputData);
            } catch (e) {}
        }
        if (inputData.items.length == 0)
            return;
        var confGr = new GlideRecord("notify_conference_call");
        if (!confGr.get(inputData.confId))
            return;
        var sourceGr = confGr.source.getRefRecord();
        if (!this._isTCMTable(sourceGr))
            return;
        var recordClass;
        if (sourceGr.getRecordClassName() === 'incident_alert_task')
            recordClass = 'incident';
        else
            recordClass = sourceGr.comm_plan.source.getRefRecord().getRecordClassName();
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(recordClass);
        var participantIds = [];
        /**
         * @param {{name: string, id: string, phoneNumber?: string, active?: boolean, email?: string}} item
         */
        function addToActivePaticipantList(item) {
            if (!item.active)
                return;
            if (!item.id)
                return;
            participantIds.push(item.id);
        }
        inputData.items.forEach(function(item) {
            if (!Array.isArray(item.users)) {
                addToActivePaticipantList(item);
                return;
            }
            item.users.forEach(function(userItem) {
                addToActivePaticipantList(userItem);
            });
        });

        function _getParticipantsFromConference(conferenceCallSysId) {
            var participants = [];
            var notifyParticipantGR = new GlideRecord('notify_participant');
            notifyParticipantGR.addQuery('notify_conference_call', conferenceCallSysId);
            notifyParticipantGR.addQuery('active', false);
            notifyParticipantGR.query();
            while (notifyParticipantGR.next())
                participants.push(notifyParticipantGR.getValue('user') || notifyParticipantGR.getValue('email'));
            return participants;
        }
        var conferenceParticipants = _getParticipantsFromConference(inputData.confId);
        participantIds = participantIds.filter(function(participant) {
            return conferenceParticipants.indexOf(participant) != -1;
        });
        // we can't pass scoped GlideRecord to global. So best is to pass sys_id and let the target again  fetch the record.
        handlerInstance.onConferenceParticipantChange(sourceGr.getUniqueValue(), participantIds);
        if (this._canFollowOnCallEscalation(inputData)) {
            var confGroups = [];
            for (var i = 0; i < inputData.items.length; i++) {
                var thisItem = inputData.items[i];
                if (!thisItem.users)
                    continue;
                if (thisItem.users.length == 0)
                    continue;
                confGroups.push(inputData.items[i].id);
            }
            if (confGroups.length > 0)
                this._attachConferenceCallEscalationWorkflow(confGr, confGroups);
        }
    },
    /**
     * @param {GlideRecord} sourceGr
     */
    _isTCMTable: function(sourceGr) {
        var tableList = new GlideTableHierarchy(sourceGr.getTableName()).getHierarchy();
        for (var i = 0; i < tableList.length; i++) {
            if (tableList[i] == 'comm_plan' || tableList[i] == 'comm_task')
                return true;
        }
        return false;
    },

    _getUserRecord: function(sysId) {
        var gr = new GlideRecord("sys_user");
        if (gr.get(sysId) && !!gr.active)
            return gr;
        return null;
    },

    _getFormattedContacts: function(contacts, inputData, type) {
        var results = [];
        var groups = {};
        var userGr;
        var notifyUtils = new global.NotifyUtil();
        var numbers = [];
        for (var i = 0; i < contacts.length; i++) {
            var contact = contacts[i];
            if (typeof contact == 'string') {
                userGr = this._getUserRecord(contact);
                if (!userGr)
                    continue;
                numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.sys_id + ''], [], type);
                results.push({
                    id: userGr.sys_id + '',
                    name: userGr.name + '',
                    phoneNumber: numbers.length > 0 ? numbers[0] : ''
                });
            } else if (typeof contact == 'object' && contact.id && contact.group && contact.groupId) {
                var groupId = contact.groupId + '';
                if (!groups[groupId]) {
                    groups[groupId] = {
                        name: contact.group.getDisplayValue(),
                        id: groupId,
                        showGroupName: this._canFollowOnCallEscalation(inputData),
                        users: []
                    };
                }
                var thisGroup = groups[groupId];
                userGr = this._getUserRecord(contact.id);
                if (!userGr)
                    continue;
                var groupName = contact.group.getDisplayValue();
                var name = contact.name ? contact.name : '';
                if (this._canFollowOnCallEscalation(inputData)) {
                    var occpUtil = new global.OnCallContactPreferenceUtil();
                    var userPrefs = occpUtil.getUserPreferences(userGr.getUniqueValue(), 1, null, type === notifyUtils.numberType.voice ? occpUtil.COMMUNICATION_TYPES.VOICE : occpUtil.COMMUNICATION_TYPES.SMS);
                    if (userPrefs.length > 0) {
                        var allNumbers = [];
                        for (var k = 0; k < userPrefs.length; k++) {
                            var pref = userPrefs[k];
                            if (allNumbers.indexOf(pref.number) == -1) {
                                var id = k ? id = contact.id + '_' + k : id = contact.id;
                                allNumbers.push(pref.number);
                                thisGroup.users.push({
                                    name: userGr.getDisplayValue(),
                                    id: id,
                                    phoneNumber: pref.number
                                });
                            }
                        }
                    } else {
                        numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.sys_id + ''], [], type);
                        thisGroup.users.push({
                            name: name,
                            id: userGr.getUniqueValue(),
                            phoneNumber: numbers.length > 0 ? numbers[0] : ''
                        });
                    }
                } else {
                    numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.sys_id + ''], [], type);
                    thisGroup.users.push({
                        name: name,
                        id: userGr.getUniqueValue(),
                        phoneNumber: numbers.length > 0 ? numbers[0] : ''
                    });
                }
            }
        }
        for (var prop in groups)
            results.push(groups[prop]);
        return results;
    },

    /**
     * @param {InputData} inputData
     * @param {ParticipantData} previousContacts
     * @returns {ParticipantData}
     */
    getContacts: function(inputData, previousContacts, type) {
        var contacts = [];
        var sourceGr = new GlideRecord(inputData.table);
        if (!sourceGr.get(inputData.sysId))
            return contacts;
        if (!this._isTCMTable(sourceGr))
            return contacts;
        var comPlanGr = null;
        if (sourceGr.comm_plan)
            comPlanGr = sourceGr.comm_plan.getRefRecord();
        if (!comPlanGr || !comPlanGr.isValidRecord())
            return contacts;

        contacts = new sn_comm_management.CommunicationManagementUtil().getContactsForConferenceModal(comPlanGr.getUniqueValue(), comPlanGr.getTableName());

        var formattedContacts = this._getFormattedContacts(contacts, inputData, type);
        if (!previousContacts)
            previousContacts = [];

        var currentContactsIdMap = {};
        var escalateConference = new sn_comm_management.CommunicationManagementUtil().isEscalateConference(comPlanGr.getUniqueValue());
        for (var i = 0; i < formattedContacts.length; i++) {
            currentContactsIdMap[formattedContacts[i].id] = true;
        }
        for (var j = 0; j < previousContacts.length; j++) {
            var previousContact = previousContacts[j];
            if (currentContactsIdMap[previousContact.id]) {
                previousContacts.splice(j, 1);
                j--;
            } else {
                if (previousContact.users) { // Means this is a group
                    var groupGr = new GlideRecord('sys_user_group');
                    groupGr.addActiveQuery();
                    if (groupGr.get(previousContact.id)) {
                        var escalateeContactsForThisGroup = new sn_comm_management.CommunicationManagementUtil().processOnCallConferenceEscalatees(groupGr, comPlanGr.getUniqueValue(), escalateConference);
                        var formattedContactsForThisGroup = this._getFormattedContacts(escalateeContactsForThisGroup, inputData, type);
                        if (formattedContactsForThisGroup[0])
                            previousContacts[j] = formattedContactsForThisGroup[0];
                    }
                }
            }
        }
        return formattedContacts;
    },

    /**
     * @param {InputData} inputData
     */
    _canFollowOnCallEscalation: function(inputData) {
        if (!GlidePluginManager.isActive("com.snc.on_call_rotation"))
            return false;
        var sourceGr = new GlideRecord(inputData.table);
        if (!sourceGr.get(inputData.sysId))
            return false;
        if (!this._isTCMTable(sourceGr))
            return false;
        return (new sn_comm_management.CommTaskNotifyUtils()).isEscalateConference(sourceGr.getTableName(), sourceGr.getUniqueValue()) == 'true';
    },

    /**
     * attach Conference Call Escalation Workflow
     */
    _attachConferenceCallEscalationWorkflow: function(conferenceCallGr, conferenceGroups) {

        if (!GlidePluginManager.isActive("com.snc.on_call_rotation"))
            return;
        if (!conferenceGroups)
            return;
        if (!Array.isArray(conferenceGroups))
            return;
        if (conferenceGroups.length == 0)
            return;
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
        for (var i = 0; i < conferenceGroups.length; i++) {
            var group = conferenceGroups[i];
            if (workFlowContextsGroupsInProgress.indexOf(group) == -1) {
                var inputs = {};
                inputs.group = group;
                inputs.firstremindersent = true;
                inputs.table = handlerInstance.getClassNameForConferenceEscalation(conferenceCallGr);
                inputs.sysid = handlerInstance.getTaskIdForConferenceEscalation(conferenceCallGr);
                var workflowSysId = handlerInstance.getConferenceCallEscalationWorkflow(group);
                var wf = new global.Workflow();
                var wfc = wf.startFlow(workflowSysId, conferenceCallGr, conferenceCallGr.operation(), inputs);
                if (!wfc) {
                    gs.warn("[attachConferenceCallEscalationWorkflow] - Failed to attach workflow context");
                } else {
                    workFlowContextsGroupsInProgress.push(group);
                }
            } else {
                var groupName = '';
                var groupGr = new GlideRecord('sys_user_group');
                if (groupGr.get(group))
                    groupName = groupGr.getDisplayValue();
                gs.info("[attachConferenceCallEscalationWorkflow] - conference call escalation workflow context for group " + groupName + " is already in progress.");
            }
        }
    },
    /**
     * @param {string} groupId
     * @param {InputData} inputData
     * @param {ParticipantData} groupData
     */
    getGroupDetails: function(groupId, inputData, alreadyGotGroupDetails, type) {
        if (!groupId)
            return;
        var grpGr = new GlideRecord("sys_user_group");
        if (!grpGr.get(groupId))
            return;

        var communicationUtil = new sn_comm_management.CommunicationManagementUtil();
        if (!GlidePluginManager.isActive("com.snc.on_call_rotation"))
            return;

        /**
         * @type {IncidentAlertTaskGR}
         */
        var sourceGr = new GlideRecord(inputData.table);
        if (!sourceGr.get(inputData.sysId))
            return;
        if (!this._isTCMTable(sourceGr))
            return;
        if (alreadyGotGroupDetails && alreadyGotGroupDetails.users && alreadyGotGroupDetails.users.length)
            // make sure delete the existing data.
            alreadyGotGroupDetails.users.splice(0, alreadyGotGroupDetails.users.length);
        /**
         * @type {IncidentAlertGR}
         */
        var comPlanGr = null;
        if (sourceGr.comm_plan)
            comPlanGr = sourceGr.comm_plan.getRefRecord();
        if (!comPlanGr || !comPlanGr.isValidRecord())
            return;
        var items = communicationUtil.getOnCallResourcesForConference(grpGr, comPlanGr.getUniqueValue());
        var response = {}, handlerInstance;
        if (comPlanGr.sys_class_name == 'incident_alert')
            handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance('incident');
        else
            handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(comPlanGr.source.getRefRecord().getRecordClassName());
        if (!communicationUtil._groupHasRotas(grpGr)) {
            var output = {};
            if (communicationUtil.getProperty(handlerInstance.PROPERTIES.ADD_ALL_MEMBERS_ON_NO_ROTA_DEFINED)) {
                output.users = items;
                output.message = {
                    messageType: "info",
                    messageText: gs.getMessage("All the members are added since the on-call rota isn't defined on the selected group.")
                };
            } else {
                output.users = [];
                output.message = {
                    messageType: "info",
                    messageText: gs.getMessage("No members are added since the on-call rota isn't defined on the selected group.")
                };
            }
            return output;
        }
        var result = [];
        var embeddedGroups = [];
        var numbers;
        var notifyUtils = new global.NotifyUtil();
        for (var i = 0; i < items.length; i++) {
            var thisItem = items[i];
            var grpId = thisItem.groupId + '';
            if (grpId !== groupId) {
                gs.warn("Got information about another group " + grpId + " while trying to get info about group " + groupId + ". Ignoring.");
                continue;
            }
            var itemType = thisItem.type + '';
            var thisResult = {
                name: thisItem.name + '',
                id: thisItem.id + '',
                groupId: groupId + ''
            };
            if (itemType == 'user') {
                var userGr = new GlideRecord("sys_user");
                if (!userGr.get(thisItem.id + ''))
                    continue;
                if (!userGr.active)
                    continue;

                if (this._canFollowOnCallEscalation(inputData)) {
                    var occpUtil = new global.OnCallContactPreferenceUtil();
                    var userPrefs = occpUtil.getUserPreferences(thisItem.id, 1, null, type === notifyUtils.numberType.voice ? occpUtil.COMMUNICATION_TYPES.VOICE : occpUtil.COMMUNICATION_TYPES.SMS);

                    if (userPrefs.length > 0) {
                        var allNumbers = [];
                        for (var k = 0; k < userPrefs.length; k++) {
                            if (userPrefs[k].number) {
                                var pref = userPrefs[k];
                                if (allNumbers.indexOf(pref.number) == -1) {
                                    var id = k ? id = thisResult.id + '_' + k : id = thisResult.id;
                                    allNumbers.push(pref.number);
                                    result.push({
                                        name: userGr.getDisplayValue(),
                                        id: id,
                                        phoneNumber: pref.number
                                    });
                                }
                            }
                        }
                        if (allNumbers.length == 0) {
                            numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue()], [], type);
                            thisResult.phoneNumber = numbers.length > 0 ? numbers[0] : '';
                            result.push(thisResult);
                        }
                    } else {
                        numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue()], [], type);
                        thisResult.phoneNumber = numbers.length > 0 ? numbers[0] : '';
                        result.push(thisResult);
                    }
                } else {
                    numbers = notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue()], [], type);
                    thisResult.phoneNumber = numbers.length > 0 ? numbers[0] : '';
                    result.push(thisResult);
                }
            } else if (itemType == 'phone_number') {
                thisResult.phoneNumber = thisItem.id + '';
                result.push(thisResult);
            } else if (itemType == "group") {
                result.push(thisResult);
                embeddedGroups.push(thisResult);
            } else {
                // if any other type comes in future , need to be handled.
                continue;
            }
        }

        response = {
            showGroupName: this._canFollowOnCallEscalation(inputData),
            users: result,
            embeddedGroups: embeddedGroups
        };

        if (!response.users || response.users.length == 0) {
            response.message = {
                messageType: "info",
                messageText: gs.getMessage("There are no on-call members available on the rota at this time for the group you selected.")
            };
        }

        return response;
    },

    isConferenceLeader: function(srcGr, /* optional */ userId) {},

    getNotifyNumber: function(sourceGr) {},

    isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {},

    type: 'ConferenceParticipantsTCM'
};
