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
var ConferenceParticipantsTCM0 = Class.create();
ConferenceParticipantsTCM0.prototype = {
	TABLE_COMM_PLAN: 'comm_plan',
	TABLE_COMM_TASK: 'comm_task',

	ACTION: {
		SELF_JOIN: 'selfJoin'
	},

    initialize: function() {
    },
	/**
	 * @param {InputData} inputData
	 * @param {ParticipantData} previousContacts
	 * @returns {ParticipantData}
	 */
	getContacts: function(inputData, previousContacts, type) {
		return [];
	},
	
	/**
	 * @param {string} groupId
	 * @param {InputData} inputData
	 * @param {ParticipantData} groupData
	 * @returns {ParticipantData}
	 */
	getGroupDetails: function(groupId, inputData, alreadyGotGroupDetails, type) {
	},
	
	/**
	 * @param {GlideRecord} sourceGr
	 * @param {string} userId
	 */
	isConferenceLeader: function(sourceGr, /* optional */ userId) {
		if (gs.nil(sourceGr) || !sourceGr.isValidRecord()) return;
		var sourceTableName = sourceGr.getTableName();
		var sourceTableHierarchy = new GlideTableHierarchy(sourceTableName).getHierarchy();
		
		if (sourceTableHierarchy.indexOf(this.TABLE_COMM_PLAN) !== -1 || sourceTableHierarchy.indexOf(this.TABLE_COMM_TASK) !== -1) 
			return new CommTaskNotifyUtils().isConferenceLeader(sourceGr, userId);
			
		return;
	},

	/**
	 * The extension point implementations are invoked in no specific order, the first one to respond
	 * its response will be taken. If no implementations return then default notify for task number will
	 * will be used.
	 * @param {GlideRecord} sourceGr
	 * @returns (string} undefined / a valid Notify number as string
	 */
	getNotifyNumber: function (sourceGr) {
	},

	/**
 	 * @param {string} actionName
 	 * @param {GlideRecord} sourceGr
	 * @param {string} userId
 	 */
	isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {},

	type: 'ConferenceParticipantsTCM0'
};
