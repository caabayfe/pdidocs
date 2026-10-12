var LASendsMessageOutputProcessor = Class.create();
LASendsMessageOutputProcessor.prototype = {
    initialize: function() {
    },
	
	// Mandatory function in every processor. This method is called after a completed response is received from One API invocation.
	processCompleted: function(oneApiResponse) {
		
	},
	
	// Mandatory function in every processor. This method is called after an error response is received from One API invocation.
	processErrored: function(oneApiResponse) {
		
	},
	
	// Mandatory function in every processor. This method is called if the one api call is cancelled.
	processCancelled: function(oneApiResponse) {
		
	},

	shouldResume: function(oneApiResponse) {
		return false;
	},
	
    type: 'LASendsMessageOutputProcessor'
};
