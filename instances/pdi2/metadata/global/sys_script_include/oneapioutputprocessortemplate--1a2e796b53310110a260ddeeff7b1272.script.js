// Template script to process response from ONE API call. 
// For every service plan in one_api_service_plan table, there should be a output processor script.

var OneAPIOutputProcessorTemplate = Class.create();
OneAPIOutputProcessorTemplate.prototype = {
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

    type: 'OneAPIOutputProcessorTemplate'
};
