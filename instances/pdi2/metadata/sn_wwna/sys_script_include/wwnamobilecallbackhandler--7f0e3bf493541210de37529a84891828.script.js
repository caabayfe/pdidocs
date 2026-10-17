const MOBILE_CHANNEL_PREFIX = '/wwna/mobile/';
    
var WWNAMobileCallbackHandler = Class.create();
WWNAMobileCallbackHandler.prototype = {
    initialize: function() {},


    process: function(/*String*/ channel, /*Object*/ parsedMessage, /*String*/ sender) {
        if (channel.startsWith(MOBILE_CHANNEL_PREFIX)) {
			    const externalKey = channel.replace(MOBILE_CHANNEL_PREFIX, '');
          new global.MobileWWNA().setGenAIResponse(externalKey, parsedMessage);
		    }
    },

    type: 'WWNAMobileCallbackHandler'
};
