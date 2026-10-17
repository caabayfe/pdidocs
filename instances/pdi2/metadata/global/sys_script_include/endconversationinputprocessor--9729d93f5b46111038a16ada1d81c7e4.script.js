var EndConversationInputProcessor = Class.create();
EndConversationInputProcessor.prototype = {
    initialize: function() {
    },
	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'EndConversationInputProcessor'
};
