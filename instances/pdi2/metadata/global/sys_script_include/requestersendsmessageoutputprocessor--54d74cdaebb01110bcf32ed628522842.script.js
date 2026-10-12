var RequesterSendsMessageOutputProcessor = Class.create();
RequesterSendsMessageOutputProcessor.prototype = {
    initialize: function() {
    },
	// Mandatory function in every processor. This method is called after a completed response is received from One API invocation.
	processCompleted: function(oneApiResponse) {
		new global.SentimentAnalysisOutputProcessor().processCompleted(oneApiResponse);
	},
	
	// Mandatory function in every processor. This method is called after an error response is received from One API invocation.
	processErrored: function(oneApiResponse) {
		new global.SentimentAnalysisOutputProcessor().processErrored(contextId, documentId, error);
	},
	
	// Mandatory function in every processor. This method is called if the one api call is cancelled.
	processCancelled: function(oneApiResponse) {
		new global.SentimentAnalysisOutputProcessor().processCancelled(contextId, documentId);
	},


    type: 'RequesterSendsMessageOutputProcessor'
};
