var TCMOnCallNotifyEscalationHandler = Class.create();
TCMOnCallNotifyEscalationHandler.prototype = {
    initialize: function() {},

    /**
     * Method to determine whether the handler can <b>HANDLE</b> provided SourceTable 
     * @param  {[string]} sourceTableName [Source Table Name]
     * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
     * @return {[boolean]}      [true/false]
     */
    canHandle: function(sourceTableName, inputData) {
        var confGr = new GlideRecord("notify_conference_call");
        if (!confGr.get(inputData.confId))
            return;
        var sourceGr = confGr.source.getRefRecord();

        return this._isTCMTable(sourceGr);
    },

    /**
     * Method can use to abort the processing based on the return value.
     * Note: This useHandler() will be considered only when canHandle() returns 'true'
     * @param  {[string]} sourceTableName [Source Table Name]
     * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
     * @return {[boolean]}      [true/false]
     */
    abortProcessing: function(sourceTableName, inputData) {
        return !this._isTCMScriptActionActive();
    },

    /**
     * Determine the activation status of On-Call follow up escalation
     * @param  {[string]} sourceTableName [Source Table Name]
     * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
     * @return {[boolean]}      [true/false]
     */
    isFollowOnCallEscalationEnabled: function(sourceTableName, sourceSysId) {
        if (!GlidePluginManager.isActive("com.snc.on_call_rotation"))
            return false;

        var sourceGr = new GlideRecord(sourceTableName);
        if (!sourceGr.get(sourceSysId))
            return false;

        if (!this._isTCMTable(sourceGr))
            return false;

        return (new sn_comm_management.CommTaskNotifyUtils()).isEscalateConference(sourceGr.getTableName(), sourceGr.getUniqueValue()) == 'true';
    },

    /**
     * Method to perform any action before executing the workflow
     * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
     */
    preWorkflowExecution: function(inputData) {
        var confGr = new GlideRecord("notify_conference_call");
        if (!confGr.get(inputData.confId))
            return;
        var sourceGr = confGr.source.getRefRecord();

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
        handlerInstance.onConferenceParticipantChange(sourceGr.getUniqueValue(), participantIds);
    },

    /**
     * Method to perform any action before executing the workflow
     * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
     * @param  {[SysId]} confGroupSysId [SysID of user group]	 
     * @return {[JSON]}      [Returns the input variables that are required for WorkFlow]	 
     */
    generateEscalationWFInputs: function(conferenceCallGr, confGroupSysId) {
        var table = '';
        if (conferenceCallGr.table + '' == 'incident_alert_task')
            table = 'incident';
        else {
            var commChannelConferenceGr = new GlideRecord('comm_channel_conference');
            commChannelConferenceGr.addQuery('notify_conference_call', conferenceCallGr.getUniqueValue());
            commChannelConferenceGr.query();
            if (commChannelConferenceGr.next()) {
                var sourceTaskGr = commChannelConferenceGr.comm_task.comm_plan.source.getRefRecord();
                table = sourceTaskGr.getRecordClassName();
            }
        }
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(table);

        var inputs = {};
        inputs.group = confGroupSysId;
        inputs.firstremindersent = true;
        inputs.table = handlerInstance.getClassNameForConferenceEscalation(conferenceCallGr);
        inputs.sysid = handlerInstance.getTaskIdForConferenceEscalation(conferenceCallGr);
        inputs.workflowSysId = handlerInstance.getConferenceCallEscalationWorkflow(confGroupSysId);

        return inputs;

    },

    /**
     * Method to perform any action before executing the SubFlow
     * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
     * @param  {[SysId]} confGroupSysId [SysID of user group]    
     * @return {[JSON]}      [Returns the input variables that are required for SubFlow]     
     */
    generateEscalationSubFlowInputs: function(conferenceCallGr, confGroupSysId) {
        var table = '';
        if (conferenceCallGr.table + '' == 'incident_alert_task')
            table = 'incident';
        else {
            var commChannelConferenceGr = new GlideRecord('comm_channel_conference');
            commChannelConferenceGr.addQuery('notify_conference_call', conferenceCallGr.getUniqueValue());
            commChannelConferenceGr.query();
            if (commChannelConferenceGr.next()) {
                var sourceTaskGr = commChannelConferenceGr.comm_task.comm_plan.source.getRefRecord();
                table = sourceTaskGr.getRecordClassName();
            }
        }
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(table);
        var inputs = {};
        inputs['group'] = confGroupSysId;
        inputs['first_reminder_sent'] = true;
        inputs['table'] = handlerInstance.getClassNameForConferenceEscalation(conferenceCallGr);
        inputs['sysid'] = handlerInstance.getTaskIdForConferenceEscalation(conferenceCallGr);
        inputs['notify_conference_gr'] = conferenceCallGr;
        return inputs;
    },

    /**
     * Method to perform any action after executing the workflow
     * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
     */
    postWorkflowExecution: function(inputData) {
        //Do Nothing
    },


    /**
     * Fetches the active status of provided Script Action SysId.
     */
    _isTCMScriptActionActive: function() {
        var TCM_SCRIPT_ACTION_SYS_ID = "ee4477d10b8023005775aabcb4673a7c";
        var EVENT_NAME = "conference.modified";

        var gr = new GlideRecord("sysevent_script_action");
        gr.addQuery('event_name', EVENT_NAME);
        gr.addQuery('sys_id', TCM_SCRIPT_ACTION_SYS_ID);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.active;
        }
        return false;
    },

    _isTCMTable: function(sourceGr) {
        var tableList = new GlideTableHierarchy(sourceGr.getTableName()).getHierarchy();
        for (var i = 0; i < tableList.length; i++) {
            if (tableList[i] == 'comm_plan' || tableList[i] == 'comm_task')
                return true;
        }
        return false;
    },

    type: 'TCMOnCallNotifyEscalationHandler'
};
