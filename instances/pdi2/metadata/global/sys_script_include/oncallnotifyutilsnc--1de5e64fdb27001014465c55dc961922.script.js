var OnCallNotifyUtilSNC = Class.create();
OnCallNotifyUtilSNC.prototype = {

    initialize: function() {
        this.notifyUtils = new global.NotifyUtil();
    },

    _getOnCallNotifyEscalationHandler: function(sourceTableName, inputData) {
        var ON_CALL_NOTIFY_ESCALATION_EXTENTION_POINT = "global.OnCallNotifyEscalationHandler";

        var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(ON_CALL_NOTIFY_ESCALATION_EXTENTION_POINT);
        if (exPointImplementations) {
            for (i = 0; i < exPointImplementations.length; i++) {
                var handler = exPointImplementations[i];
                if (handler.canHandle(sourceTableName, inputData)) {
                    return handler;
                }
            }
        }
        return;
    },

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

        var sourceTableName = inputData.table;
        var sourceSysId = inputData.sysId;
        var handler = this._getOnCallNotifyEscalationHandler(sourceTableName, inputData);
        if (!handler) {
            gs.error("Unable to find handler to process OnCallNotifyEscalation. InputData: {0}", inputData);
            return;
        }

        if (!handler.abortProcessing(sourceTableName, inputData)) {
            gs.info("OnCallNotifyUtilSNC: Script action processing aborted as it was aborted by " + handler.type);
            return;
        }

        var shouldUseSubflow = this.shouldUseSubflow();
        //Call preWorkflowExecution of the handler.
        handler.preWorkflowExecution(inputData);

        if (handler.isFollowOnCallEscalationEnabled(sourceTableName, sourceSysId)) {
            var confGroups = [];
            for (var i = 0; i < inputData.items.length; i++) {
                var thisItem = inputData.items[i];
                if (!thisItem.users)
                    continue;
                if (thisItem.users.length == 0)
                    continue;
                confGroups.push(inputData.items[i].id);
            }
            if (confGroups.length > 0) {
                if (shouldUseSubflow) {
                    this._attachConferenceCallEscalationSubFlow(handler, confGr, confGroups);
                } else {
                    this._attachConferenceCallEscalationWorkflow(handler, confGr, confGroups);
                }
            }
        }

        //Call preWorkflowExecution of the handler.
        handler.postWorkflowExecution(inputData);
    },

    /**
     * attach Conference Call Escalation Workflow
     */
    _attachConferenceCallEscalationWorkflow: function(handler, conferenceCallGr, conferenceGroups) {
        if (!conferenceGroups)
            return;
        if (!Array.isArray(conferenceGroups))
            return;
        if (conferenceGroups.length == 0)
            return;

        var workFlowContextsGroupsInProgress = [];
        var workFlowContextsInProgressGr = new global.Workflow().getRunningFlows(conferenceCallGr);
        while (workFlowContextsInProgressGr.next()) {
            if (workFlowContextsInProgressGr.scratchpad.group && workFlowContextsInProgressGr.scratchpad.group.sys_id) {
                if (workFlowContextsGroupsInProgress.indexOf(workFlowContextsInProgressGr.scratchpad.group.sys_id) == -1)
                    workFlowContextsGroupsInProgress.push(workFlowContextsInProgressGr.scratchpad.group.sys_id);
            }
        }
        for (var i = 0; i < conferenceGroups.length; i++) {
            var groupSysId = conferenceGroups[i];
            if (workFlowContextsGroupsInProgress.indexOf(groupSysId) == -1) {
                var inputs = handler.generateEscalationWFInputs(conferenceCallGr, groupSysId);
                var workflowSysId = inputs.workflowSysId;
                if (workflowSysId) {
                    var wf = new global.Workflow();
                    var wfc = wf.startFlow(workflowSysId, conferenceCallGr, conferenceCallGr.operation(), inputs);
                    if (!wfc) {
                        gs.warn("[attachConferenceCallEscalationWorkflow] - Failed to attach workflow context");
                    } else {
                        workFlowContextsGroupsInProgress.push(groupSysId);
                    }
                }
            } else {
                var groupName = '';
                var groupGr = new GlideRecord('sys_user_group');
                if (groupGr.get(groupSysId))
                    groupName = groupGr.getDisplayValue();
                gs.info("[attachConferenceCallEscalationWorkflow] - conference call escalation workflow context for group " + groupName + " is already in progress.");
            }
        }
    },

    _attachConferenceCallEscalationSubFlow: function(handler, conferenceCallGr, conferenceGroups) {
        if (!conferenceGroups)
            return;
        if (!Array.isArray(conferenceGroups))
            return;
        if (conferenceGroups.length == 0)
            return;

        var flowUtil = new global.OnCallFlowUtilsSNC();
        var subFlowContextsGroupsInProgress = [];

        var subFlowContextsInProgressGr = sn_fd.FlowAPI.getRunningFlows(conferenceCallGr, false, "On-Call: Conference Call Escalation Main");

        var subflowContextSysId = [];
        while (subFlowContextsInProgressGr.next()) {
            subflowContextSysId.push(subFlowContextsInProgressGr.sys_id + "");
        }

        var escResponses = flowUtil.getEscalationResponses(subflowContextSysId.join(","));
        while (escResponses && escResponses.next()) {
            var confGroupSysId = escResponses.source + "";
            if (subFlowContextsGroupsInProgress.indexOf(confGroupSysId) == -1)
                subFlowContextsGroupsInProgress.push(confGroupSysId);
        }

        for (var i = 0; i < conferenceGroups.length; i++) {
            var groupSysId = conferenceGroups[i];

            if (subFlowContextsGroupsInProgress.indexOf(groupSysId) == -1) {
                var inputs = handler.generateEscalationSubFlowInputs(conferenceCallGr, groupSysId);
                var subFlow = this.getConferenceCallEscalationSubFlow(inputs.table);
                if (subFlow) {
                    var result = sn_fd.FlowAPI.getRunner()
                        .subflow(subFlow)
                        .inBackground()
                        .withInputs(inputs)
                        .sourceRecordId(conferenceCallGr.getUniqueValue())
                        .sourceTable(conferenceCallGr.getRecordClassName())
                        .run();

                    var contextId = result.getContextId();

                    if (global.OnCallWorkflowUtilsSNC) {
                        flowUtil = new global.OnCallFlowUtilsSNC();
                        flowUtil.createEscalationResponse(null, groupSysId, "sys_user_group", null, contextId);
                    }
                }
            } else {
                var groupName = '';
                var groupGr = new GlideRecord('sys_user_group');
                if (groupGr.get(groupSysId))
                    groupName = groupGr.getDisplayValue();
                gs.info("[attachConferenceCallEscalationSubFlow] - conference call escalation SubFlow context for group " + groupName + " is already in progress.");
            }
        }
    },

    /**
     * Add a participant into a conference call
     *
     * @param participant
     * @param {NotifyConferenceCallGR} conferenceCall
     * @returns {boolean}
     * @private
     */
    addParticipantToCall: function(participant, conferenceCall, groupId) {
        var sourceGr = conferenceCall.source.getRefRecord();

        if (!sourceGr.canRead()) {
            gs.addErrorMessage(gs.getMessage('Do not have enough permissions to make a call'));
            return false;
        }

        /**
         * @type {SysUserGR}
         */
        var user = this._getUserByID(participant);
        var to = this.getPhoneNumber(participant);

        // define the number to call
        if (!to) {
            // participant is a device
            to = participant;
            var contactPrefUtils = new OnCallContactPreferenceUtil();
            var userId = contactPrefUtils.getUserFromDeviceOrContactSource(participant, 'Voice');
            if (userId)
                user = this._getUserByID(userId + "");
        }

        // got a number?
        if (to) {

            // This code is meant for scenario where customers are upgrading from pre-New York instance and so the new API
            // NotifyConferenceUtils (introduced in NY) is not yet available.
            if (typeof global.NotifyConferenceUtils == 'undefined') {
                if (conferenceCall.service_provider && conferenceCall.service_provider != "Telephony")
                    return false;

                var from = conferenceCall.getDisplayValue("notify_number");
                var notify = new SNC.Notify();
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

    getPhoneNumber: function(userId) {
        var user = this._getUserByID(userId);
        var to = '';

        if (user) {
            var numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userId], [], this.notifyUtils.numberType.voice);
            if (numbers.length > 0)
                to = numbers[0];
        }
        return to;
    },

    _getEscalateeDisplayProps: function(userId, groupGr, escalateeType, isEscalation, rosterId) {
        var props = {
            name: '',
            color: 'black'
        };

        var rosterName = this._getRosterName(rosterId);
        if (!rosterName)
            rosterName = "";

        if (isEscalation) {
            var userGr = this._getUserByID(userId);
            if (userGr)
                props.name = userGr.name;
            return props;
        }
        var name = '';
        var additionalInformation = '';
        if (escalateeType == 'user') {
            var userGr = this._getUserByID(userId);
            additionalInformation = gs.getMessage('{0} ({1} {2})', [userGr.name, rosterName, groupGr.name]);
            // lookup the voice numbers for this contact
            numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userId], [], this.notifyUtils.numberType.voice);
            if (numbers.length == 0)
                props.color = 'tomato'; // has no number, mark as red
        } else if (escalateeType == 'phone_number') {
            additionalInformation = gs.getMessage('{0} ({1} {2})', [userId, rosterName, groupGr.name]);
        }

        props.name = additionalInformation;
        return props;
    },

    addEscalatee: function(escalatee, currentOncallEscalatees, groupGr, isEscalation, taskGr) {
        if (escalatee.userId && this._isUserActive(escalatee.userId)) {
            var props = this._getEscalateeDisplayProps(escalatee.userId, groupGr, 'user', isEscalation, escalatee.rosterId);
            currentOncallEscalatees.push({
                id: escalatee.userId,
                level: escalatee.order,
                group: groupGr.name,
                groupId: groupGr.sys_id,
                type: 'user',
                name: props.name,
                color: props.color
            });
        }
        for (var i = 0; i < escalatee.userIds.length; i++) {
            var user = escalatee.userIds[i];
            if (user && this._isUserActive(user)) {
                var props = this._getEscalateeDisplayProps(user, groupGr, 'user', isEscalation, escalatee.rosterId);
                currentOncallEscalatees.push({
                    id: user,
                    level: escalatee.order,
                    group: groupGr.name,
                    groupId: groupGr.sys_id,
                    type: 'user',
                    name: props.name,
                    color: props.color
                });
            }
        }
        if (escalatee.deviceId) {
            var deviceGr1 = new GlideRecord('cmn_notif_device');
            deviceGr1.addActiveQuery();
            if (deviceGr1.get(escalatee.deviceId)) {
                if (deviceGr1.phone_number + '' && deviceGr1.type == "Voice") {
                    var props1 = this._getEscalateeDisplayProps(deviceGr1.phone_number + '', groupGr, 'phone_number', isEscalation, escalatee.rosterId);
                    currentOncallEscalatees.push({
                        id: deviceGr1.phone_number + '',
                        level: escalatee.order,
                        group: groupGr.name,
                        groupId: groupGr.sys_id,
                        type: 'phone_number',
                        name: props1.name,
                        color: props1.color
                    });
                }
            }
        }
        for (var j = 0; j < escalatee.deviceIds.length; j++) {
            var deviceSysId = escalatee.deviceIds[j];
            var deviceGr = new GlideRecord('cmn_notif_device');
            deviceGr.addActiveQuery();
            if (deviceGr.get(deviceSysId)) {
                if (deviceGr.phone_number + '' && deviceGr.type == "Voice") {
                    var props = this._getEscalateeDisplayProps(deviceGr.phone_number + '', groupGr, 'phone_number', isEscalation, escalatee.rosterId);
                    currentOncallEscalatees.push({
                        id: deviceGr.phone_number + '',
                        level: escalatee.order,
                        group: groupGr.name,
                        groupId: groupGr.sys_id,
                        type: 'phone_number',
                        name: props.name,
                        color: props.color
                    });
                }
            }
        }

        this.addEscalateeFromParallelGroup(escalatee, currentOncallEscalatees, groupGr, isEscalation, taskGr);

    },

    addEscalateeFromParallelGroup: function(escalatee, currentOncallEscalatees, groupGr, isEscalation, taskGr) {
        for (var groupCounter = 0; groupCounter < escalatee.escalationGroups.length; groupCounter++) {
            var parallelGroupId = escalatee.escalationGroups[groupCounter] + "";
            var ocRotation = new global.OnCallRotation();
            var escPlan = ocRotation.getEscalationPlan(parallelGroupId, null, "", taskGr);
            var depth = 1;
            var planSize = escPlan.length;
            var displayPlanSize = ((depth == -1) || (depth >= planSize)) ? planSize : depth;

            if (groupGr) {
                for (var parallelGroupEscCounter = 0; parallelGroupEscCounter < displayPlanSize; parallelGroupEscCounter++) {
                    var parallelGroupEscalatee = escPlan[parallelGroupEscCounter];
                    this.addEscalatee(parallelGroupEscalatee, currentOncallEscalatees, groupGr, isEscalation, taskGr);
                    for (var j = 0; j < parallelGroupEscalatee.additionalEscalatees.length; j++) {
                        var additionalEscalatee = parallelGroupEscalatee.additionalEscalatees[j];
                        this.addEscalatee(additionalEscalatee, currentOncallEscalatees, groupGr, isEscalation, taskGr);
                    }
                }
            }
        }
    },

    fetchUsersOnEscalateesPreferences: function(groupId, inputData, currentOncallEscalatees, type) {
        var result = [];

        if (!currentOncallEscalatees)
            return;

        for (var i = 0; i < currentOncallEscalatees.length; i++) {
            var thisItem = currentOncallEscalatees[i];
            var grpId = thisItem.groupId + '';
            if (grpId !== groupId) {
                gs.warn("Got information about another group " + grpId + " while trying to get info about group " + groupId + ". Ignoring.");
                continue;
            }
            var itemType = thisItem.type + '';
            var thisResult = {
                name: thisItem.name + '',
                id: thisItem.id + ''
            };
            if (itemType == 'user') {
                var userGr = new GlideRecord("sys_user");
                if (!userGr.get(thisItem.id + ''))
                    continue;
                if (!userGr.active)
                    continue;

                if (this.isFollowOnCallEscalationEnabled(inputData.table)) {
                    var occpUtil = new global.OnCallContactPreferenceUtil();
                    var userPrefs = occpUtil.getUserPreferences(thisItem.id, 1, null, type === this.notifyUtils.numberType.voice ? occpUtil.COMMUNICATION_TYPES.VOICE : occpUtil.COMMUNICATION_TYPES.SMS);
                    if (userPrefs.length > 0) {
                        var allNumbers = [];
                        for (var k = 0; k < userPrefs.length; k++) {
                            var pref = userPrefs[k];
                            if (allNumbers.indexOf(pref.number) == -1) {
                                var id = k ? id = thisResult.id + '_' + k : id = thisResult.id;
                                allNumbers.push(pref.number);
                                result.push({
                                    name: userGr.getDisplayValue(),
                                    id: id,
                                    sysId: thisResult.id,
                                    phoneNumber: pref.number
                                });
                            }
                        }
                    } else {
                        numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue()], [], type);
                        thisResult.phoneNumber = numbers.length > 0 ? numbers[0] : '';
                        result.push(thisResult);
                    }
                } else {
                    numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue()], [], type);
                    thisResult.phoneNumber = numbers.length > 0 ? numbers[0] : '';
                    result.push(thisResult);
                }
            } else if (itemType == 'phone_number') {
                thisResult.phoneNumber = thisItem.id + '';
                result.push(thisResult);
            } else {
                // if any other type comes in future , need to be handled.
                continue;
            }
        }
        return result;
    },

    _getRosterName: function(rosterId) {
        var rosterGr = new GlideRecord('cmn_rota_roster');
        if (rosterGr.get(rosterId))
            return rosterGr.name;
    },

    _getUserByID: function(id) {
        return this._getRecordBySysID('sys_user', id);
    },

    _getRecordBySysID: function(table, id) {
        var record = new GlideRecord(table);
        if (record.get(id))
            return record;
    },

    _isUserActive: function(userId) {
        var gr = new GlideRecord("sys_user");
        return gr.get(userId) && gr.active == true;
    },


    PROPERTIES: {
        DEFAULT_ESCALATION_LEVEL: 'com.snc.notify.default.on_call_escalation_level',
        DEFAULT_ESCALATE_CONFERENCE: 'com.snc.notify.default.conference_call_follow_on_call_escalation',
        DEFAULT_ESCALATION_WORKFLOW: 'com.snc.notify.default.conference_call_escalation_workflow',
        DEFAULT_ESCALATION_SUBFLOW: 'com.snc.notify.default.conference_call_escalation_subflow',
        DEFAULT_NO_ROTA_ADD_ALL_GROUP_MEMBERS: 'com.snc.notify.default.add_all_members_on_no_rota_defined',
        USE_SUBFLOW_FOR_CONFERENCE: 'com.snc.notify.use_subflow_for_conference_escalation',

        _getConferenceCallEscalationWorkflowSysId: function(sourceTableName) {
            var pattern = /[0-9A-F]{32}/i;

            if (!sourceTableName)
                return;

            var NOTIFY_BASE_PREFIX = 'com.snc.notify.';
            var CONFERENCE_CALL_ESCALATION_WORKFLOW_SUFFIX = '.conference_call_escalation_workflow';

            var propKey = NOTIFY_BASE_PREFIX + sourceTableName + CONFERENCE_CALL_ESCALATION_WORKFLOW_SUFFIX;
            var workflowSysID = gs.getProperty(propKey);
            if (workflowSysID && pattern.test(workflowSysID.trim())) {
                return workflowSysID.trim();
            } else {
                gs.warn("Configured workflow sysid for property '{0}' is not valid, hence using default property '{1}' value, if exists. ", propKey, this.DEFAULT_ESCALATION_WORKFLOW);
            }

            var defaultWorkflowSysID = gs.getProperty(this.DEFAULT_ESCALATION_WORKFLOW);
            if (defaultWorkflowSysID && pattern.test(defaultWorkflowSysID.trim()))
                return defaultWorkflowSysID.trim();
            else
                gs.warn("Configured workflow sysid for property '{0}' is NOT valid.", this.DEFAULT_ESCALATION_WORKFLOW);

            return;
        },

        _getConferenceCallEscalationSubFlow: function(sourceTableName) {
            if (!sourceTableName)
                return;

            var NOTIFY_BASE_PREFIX = 'com.snc.notify.';
            var CONFERENCE_CALL_ESCALATION_SUBFLOW_SUFFIX = '.conference_call_escalation_subflow';

            var propKey = NOTIFY_BASE_PREFIX + sourceTableName + CONFERENCE_CALL_ESCALATION_SUBFLOW_SUFFIX;
            var subFlow = gs.getProperty(propKey);
            if (subFlow) {
                return subFlow.trim();
            } else {
                gs.warn("Configured subflow sysid for property '{0}' is not valid, hence using default property '{1}' value, if exists. ", propKey, this.DEFAULT_ESCALATION_SUBFLOW);
            }

            var defaultSubFlow = gs.getProperty(this.DEFAULT_ESCALATION_SUBFLOW);
            if (defaultSubFlow)
                return defaultSubFlow.trim();
            else
                gs.warn("Configured subflow sysid for property '{0}' is NOT valid.", this.DEFAULT_ESCALATION_SUBFLOW);

            return;
        },

        _getOnCallEscalationLevel: function(sourceTableName) {
            if (!sourceTableName)
                return;

            var NOTIFY_BASE_PREFIX = 'com.snc.notify.';
            var ESCALATION_LEVEL_SUFFIX = '.on_call_escalation_level';

            var propKey = NOTIFY_BASE_PREFIX + sourceTableName + ESCALATION_LEVEL_SUFFIX;
            if (gs.getProperty(propKey) && !isNaN(gs.getProperty(propKey)))
                return gs.getProperty(propKey) * 1;

            return gs.getProperty(this.DEFAULT_ESCALATION_LEVEL, 2) * 1;
        },

        _isFollowOnCallEscalationEnabled: function(sourceTableName) {
            if (!sourceTableName)
                return;

            var NOTIFY_BASE_PREFIX = 'com.snc.notify.';
            var ESCALATE_CONFERENCE_SUFFIX = '.conference_call_follow_on_call_escalation';
            var propKey = NOTIFY_BASE_PREFIX + sourceTableName + ESCALATE_CONFERENCE_SUFFIX;

            var propValue = gs.getProperty(propKey, "");
            if (propValue != "") {
                if (propValue == "true")
                    return true;
                else if (propValue == "false")
                    return false;
                else {
                    gs.warn("Invalid property value. The value for the property '{0}' should be either true or false but is '{1}'", propKey, propValue);
                    return;
                }
            }
            return gs.getProperty(this.DEFAULT_ESCALATE_CONFERENCE) == "true";
        },

        _isAddAllMembersOnNoRotaEnabled: function(sourceTableName) {
            if (!sourceTableName)
                return;
            var NOTIFY_BASE_PREFIX = 'com.snc.notify.';
            var ADD_ALL_MEMBERS_ON_NO_ROTA = '.add_all_members_on_no_rota_defined';
            var propKey = NOTIFY_BASE_PREFIX + sourceTableName + ADD_ALL_MEMBERS_ON_NO_ROTA;
            var propValue = gs.getProperty(propKey, "");
            if (propValue != "") {
                if (propValue == "true")
                    return true;
                else if (propValue == "false")
                    return false;
                else {
                    gs.warn("Invalid property value. The value for the property '{0}' should be either true or false but is '{1}'", propKey, propValue);
                    return;
                }
            }
            return gs.getProperty(this.DEFAULT_NO_ROTA_ADD_ALL_GROUP_MEMBERS) == "true";
        },

        _shouldUseSubFlow: function() {
            return gs.getProperty(this.USE_SUBFLOW_FOR_CONFERENCE) == "true";
        }
    },

    isAddAllMembersOnNoRotaEnabled: function(sourceTableName) {
        return this.PROPERTIES._isAddAllMembersOnNoRotaEnabled(sourceTableName);
    },

    getOnCallEscalationLevel: function(sourceTableName) {
        return this.PROPERTIES._getOnCallEscalationLevel(sourceTableName);
    },

    isFollowOnCallEscalationEnabled: function(sourceTableName) {
        return this.PROPERTIES._isFollowOnCallEscalationEnabled(sourceTableName);
    },

    getConferenceCallEscalationWorkflowSysId: function(sourceTableName) {
        return this.PROPERTIES._getConferenceCallEscalationWorkflowSysId(sourceTableName);
    },

    getConferenceCallEscalationSubFlow: function(sourceTableName) {
        return this.PROPERTIES._getConferenceCallEscalationSubFlow(sourceTableName);
    },

    shouldUseSubflow: function() {
        return this.PROPERTIES._shouldUseSubFlow();
    },

    type: 'OnCallNotifyUtilSNC'
};
