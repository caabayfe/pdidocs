var OnCallCommunicationProviderVoice = Class.create();
OnCallCommunicationProviderVoice.prototype = Object.extendsObject(OnCallCommunicationProviderUtil, {
    initialize: function() {

    },

    getCommType: function() {
		return 'voice';
    },

    getAdditionalVariablesForMessages: function(table, sysId, communicationConfigGr) {
		return {
			"notify_number": new OnCallWorkflowUtils().getOnCallGroupNotifyNumber() + ''
		};
    },

    processResponse: function(sourceGr, response, extraParams) {

    },

    type: 'OnCallCommunicationProviderVoice'
});
