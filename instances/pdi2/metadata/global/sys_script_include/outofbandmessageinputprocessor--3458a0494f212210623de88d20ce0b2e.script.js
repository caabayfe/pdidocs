var OutOfBandMessageInputProcessor = Class.create();
OutOfBandMessageInputProcessor.prototype = {
    initialize: function() {
    },
	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'OutOfBandMessageInputProcessor'
};
