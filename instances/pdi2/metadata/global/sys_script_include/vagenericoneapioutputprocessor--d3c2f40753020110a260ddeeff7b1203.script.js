// This script is the generic output processor for VA internal use cases.
    //The script ties the response from One Api call to hybrid queue which ensures all VA specific execution happens in VA thread.
    //It should not be modified unless we want a change which is needed for all the One Api Calls for VA.

var VAGenericOneApiOutputProcessor = Class.create();
VAGenericOneApiOutputProcessor.prototype = {
    initialize: function() {
    },
	
	// This method is called for every VA One Api Call complete response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processCompleted: function(oneApiResponse) {
		sn_cs.VAOneApi.vaOneApiCompleted(oneApiResponse);
	},

	// This method is called for every VA One Api Call error response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processErrored: function(oneApiResponse) {
		sn_cs.VAOneApi.vaOneApiErrored(oneApiResponse);
	},

	// This method is called for every VA One Api Call cancel response.
	// It's only job is to pass the response through a scriptable which can be then tied back to Hybrid Queue.
	processCancelled: function(oneApiResponse) {
		sn_cs.VAOneApi.vaOneApiCancelled(oneApiResponse);
	},
	
	shouldResume: function(oneApiResponse) {
		return false;
	},

    type: 'VAGenericOneApiOutputProcessor'
};
