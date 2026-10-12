var VAToLATransferInputProcessor = Class.create();
VAToLATransferInputProcessor.prototype = {
    initialize: function() {},

    process: function(input) {
        input['Sentiment Analysis'] = {
		'deviceType' : input.deviceType,
            'conversationId': input.conversationId,
            'message': input.message
			
        };
        return input;
    },

    shouldPause: function(input) {
        return false;
    },

    type: 'VAToLATransferInputProcessor'
};
