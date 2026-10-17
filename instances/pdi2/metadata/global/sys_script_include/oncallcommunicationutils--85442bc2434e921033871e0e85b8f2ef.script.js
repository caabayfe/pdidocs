var OnCallCommunicationUtils = Class.create();
OnCallCommunicationUtils.prototype = Object.extendsObject(OnCallCommunicationUtilsSNC, {
    initialize: function() {
        OnCallCommunicationUtilsSNC.prototype.initialize.call(this);
    },

    type: 'OnCallCommunicationUtils'
});
