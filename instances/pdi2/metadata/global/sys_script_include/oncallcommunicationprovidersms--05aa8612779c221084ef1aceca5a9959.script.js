var OnCallCommunicationProviderSMS = Class.create();
OnCallCommunicationProviderSMS.prototype = Object.extendsObject(OnCallCommunicationProviderUtil, {
    initialize: function() {

    },

    getCommType: function() {
        return 'sms';
    },

    getAdditionalVariablesForMessages: function(sourceGr, communicationConfigGr) {
        return {
            "on_call_group_notify_number": new OnCallWorkflowUtils().getOnCallGroupNotifyNumber() + ''
        };
    },

    processResponse: function(sourceGr, response, extraParams) {

    },

    type: 'OnCallCommunicationProviderSMS'
});
