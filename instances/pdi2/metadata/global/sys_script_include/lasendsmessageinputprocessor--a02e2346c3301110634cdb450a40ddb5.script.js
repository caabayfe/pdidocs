var LASendsMessageInputProcessor = Class.create();
LASendsMessageInputProcessor.prototype = {
    initialize: function() {
    },
	
	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},
	
    type: 'LASendsMessageInputProcessor'
};
