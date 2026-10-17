var OnCallCommunicationProvider = Class.create();
OnCallCommunicationProvider.prototype = {
    initialize: function() {

    },

    /**
     * Retrieves the communication type supported by the implementation.
     *
     * @returns {string} - The communication type constant such as 'teams', 'sms', 'voice', 'slack', 'email', 'mobile_notification', etc.
     */
    getCommType: function() {

    },

    /**
     * Define any provider-specific inputs to be used as variables in the notification/communication content, configured in the communication channel config record
     *
     * @param {GlideRecord} sourceGr - The source GlideRecord (e.g., 'incident', 'task').
     * @param {GlideRecord} communicationConfigGr - The communication channel configuration GlideRecord.
     * @returns {Object} - Returns an object containing the inputs for the communication content
     */
    getAdditionalVariablesForMessages: function(sourceGr, communicationConfigGr) {

    },

    /**
     * Define any additional response handlers to process incoming response for a communication channel type
     *
     * @param {GlideRecord} sourceGr - The taskGr GlideRecord (e.g., 'incident', 'task').
     * @param {string} response - The response string that needs to be parsed.
     * @param {JSON} extraParams - The extraParams JSON with any extra parameters needed.
     * @returns {Any} - Can return any response based on the consuming channel requirements.
     */
    processResponse: function(sourceGr, response, extraParams) {

    },

    type: 'OnCallCommunicationProvider'
};
