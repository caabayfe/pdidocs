var NowAssistDeviceSupportMWeb = Class.create();
NowAssistDeviceSupportMWeb.prototype = {
    initialize: function() {
    },

    isGenAIGeniusTemplateSupported: function(deviceType) {
		return deviceType == "mweb" ? true : false;
    },

    type: 'NowAssistDeviceSupportMWeb'
};
