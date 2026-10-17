var OnCallNotifyEscalationHandler = Class.create();
OnCallNotifyEscalationHandler.prototype = {
    initialize: function() {
    },
	/**
	 * Method to determine whether the handler can <b>HANDLE</b> provided SourceTable 
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */
	canHandle: function(sourceTableName, inputData) {
	},
	
	/**
	 * Method can use to abort the processing based on the return value.
	 * Note: This abortProcessing() will be considered only when canHandle() returns 'true'
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */	
	abortProcessing: function(sourceTableName, inputData) {
	},

	/**
	 * Determine the activation status of On-Call follow up escalation
	 * @param  {[string]} sourceTableName [Source Table Name]
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 * @return {[boolean]}      [true/false]
	 */		
    isFollowOnCallEscalationEnabled: function(sourceTableName, sourceSysId) {
	},
	
	/**
	 * Method to perform any action before executing the workflow
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 */		
	preWorkflowExecution: function(inputData) {
	},
	
	/**
	 * Method to perform any action before executing the workflow
	 * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
	 * @param  {[SysId]} confGroupSysId [SysID of user group]	 
	 * @return {[JSON]}      [Returns the input variables that are required for WorkFlow]	 
	 */		
	generateEscalationWFInputs: function(conferenceCallGr, confGroupSysId) {
	},

	/**
	 * Method to perform any action before executing the SubFlow
	 * @param  {[ConferenceCallGr]} conferenceCallGr [Conference Call Glide Record]
	 * @param  {[SysId]} confGroupSysId [SysID of user group]	 
	 * @return {[JSON]}      [Returns the input variables that are required for SubFlow]	 
	 */		
	generateEscalationSubFlowInputs: function(conferenceCallGr, confGroupSysId) {
	},
	
	/**
	 * Method to perform any action after executing the workflow
	 * @param  {[JSON]} inputData [EventData parm1 of conference.modified]
	 */		
	postWorkflowExecution: function(inputData) {
	},

    type: 'OnCallNotifyEscalationHandler'
};
