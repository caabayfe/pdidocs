var RequesterSendsMessageInputProcessor = Class.create();
RequesterSendsMessageInputProcessor.prototype = {
    initialize: function() {
    },
	process: function(input) {
		return input;
	},
	
	shouldPause: function(input) {
		return false;
	},

    type: 'RequesterSendsMessageInputProcessor'
};
