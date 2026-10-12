var VAPreTopicDiscoverOneApiOutputProcessor = Class.create();
VAPreTopicDiscoverOneApiOutputProcessor.prototype = {
    initialize: function() {
    },
	
	// This method is called for every VA One Api Call complete response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processCompleted: function(oneApiResponse) {
		
	},
	
	// This method is called for every VA One Api Call error response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processErrored: function(oneApiResponse) {
		
	},
	
	// This method is called for every VA One Api Call cancel response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processCancelled: function(oneApiResponse) {
		
	},
	
	shouldResume: function(oneApiResponse) {
		return false;
	},

    type: 'VAPreTopicDiscoverOneApiOutputProcessor'
};
