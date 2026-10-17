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

    initialize: function() {
    },
	/**
	 * @param {InputData} inputData
	 * @param {ParticipantData} previousContacts
	 * @param {String} type - NotifyUtil.numberType.sms | NotifyUtil.numberType.voice
	 * @returns {ParticipantData}
	 */
	getContacts: function(inputData, previousContacts, type) {
		return [];
	},
	
	/**
	 * @param {string} groupId
	 * @param {InputData} inputData
	 * @param {ParticipantData} groupData
	 * @param {String} type - NotifyUtil.numberType.sms | NotifyUtil.numberType.voice
	 * @returns {ParticipantData}
	 */
	getGroupDetails: function(groupId, inputData, /* Optional */alreadyGotGroupDetails, type) {
	},
	
	/**
	 * @param {GlideRecord} sourceGr
	 * @param {string} userId
	 */
	isConferenceLeader: function(sourceGr, /* Optional */ userId) {
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
   isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {
   },

    type: 'ConferenceParticipants'
};
