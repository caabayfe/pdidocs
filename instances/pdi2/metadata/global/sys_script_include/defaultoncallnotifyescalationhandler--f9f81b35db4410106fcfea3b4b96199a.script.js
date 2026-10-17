var DefaultOnCallNotifyEscalationHandler = Class.create();
DefaultOnCallNotifyEscalationHandler.prototype = {
    initialize: function() {
    },
	
	/**
	 * Method to determine whether the handler can <b>HANDLE</b> provided SourceTable 
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */	
	canHandle: function(sourceTableName, inputData) {
		return true;
	},
	
	/**
	 * Method can use to abort the processing based on the return value.
	 * Note: This useHandler() will be considered only when canHandle() returns 'true'
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */		
	abortProcessing: function(sourceTableName, inputData) {
		return true;
	},

	/**
	 * Determine the activation status of On-Call follow up escalation
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */		
    isFollowOnCallEscalationEnabled: function(sourceTableName, sourceSysId) {
		return new OnCallNotifyUtilSNC().isFollowOnCallEscalationEnabled(sourceTableName);
	},
	
	/**
	 * Method to perform any action before executing the workflow
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 */		
	preWorkflowExecution: function(inputData) {
		//Do Nothing
	},
	
	/**
	 * Method to perform any action before executing the workflow
	 * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
	 * @param  {[SysId]} confGroupSysId [SysID of user group]	 
	 * @return {[JSON]}      [Returns the input variables that are required for WorkFlow]	 
	 */		
	generateEscalationWFInputs: function(conferenceCallGr, confGroupSysId) {
		var sourceTableName = conferenceCallGr.source.getRefRecord().getRecordClassName();
		var inputs = {};
		inputs.group = confGroupSysId;
		inputs.firstremindersent = true;
		inputs.table = sourceTableName;
		inputs.sysid = conferenceCallGr.source + '';
		inputs.workflowSysId = new OnCallNotifyUtilSNC().getConferenceCallEscalationWorkflowSysId(sourceTableName);
		return inputs;
	},

	/**
	 * Method to perform any action before executing the SubFlow
	 * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
	 * @param  {[SysId]} confGroupSysId [SysID of user group]	 
	 * @return {[JSON]}      [Returns the input variables that are required for SubFlow]	 
	 */
	generateEscalationSubFlowInputs: function(conferenceCallGr, confGroupSysId) {
		var sourceTableName = conferenceCallGr.source.getRefRecord().getRecordClassName();
		var inputs = {};
		inputs['group'] = confGroupSysId;
		inputs['first_reminder_sent'] = true;
		inputs['table'] = sourceTableName;
		inputs['sysid'] = conferenceCallGr.source + '';
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

    type: 'DefaultOnCallNotifyEscalationHandler'
};
