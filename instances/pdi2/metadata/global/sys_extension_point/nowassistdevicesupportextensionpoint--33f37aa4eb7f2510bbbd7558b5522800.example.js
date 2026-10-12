var NowAssistDeviceSupportExtensionPoint = Class.create();
NowAssistDeviceSupportExtensionPoint.prototype = {
    initialize: function() {
    },

    isGenAIGeniusTemplateSupported: function(deviceType) {
        return false;
    },

    type: 'NowAssistDeviceSupportExtensionPoint'
};
