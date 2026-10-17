var VALanguageDetectionResponseProcessor = Class.create();
VALanguageDetectionResponseProcessor.prototype = {
    initialize: function() {
    },
	
	// This method gets called on a successful feature response for a given feature in One Api Execution.
	/**
	
		{
			"requestId" : "asasdw313212dsdfds",
			"status" : "success",
			"meta" : {
			},
			"result" : {
			},
			"errors" : []
		}
	*/
	processSuccess: function(featureResponse) {
		
	},
	
	// This method gets called on a failure feature response for a given feature in One Api Execution.
		/**
	
		{
			"requestId" : "asasdw313212dsdfds",
			"status" : "failure",
			"meta" : {
			},
			"result" : {
			},
			"errors" : []
		}
	*/
	processFailure: function(featureResponse) {
		
	},

    type: 'VALanguageDetectionResponseProcessor'
};
