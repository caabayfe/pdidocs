var VAOneExtendDefaultCallback = Class.create();
VAOneExtendDefaultCallback.prototype = {
    initialize: function() {
    },
	
	processCompleted: function(response) {
		sn_cs.VASystemObject.oneExtendCompleted(response);
	},
	
	processErrored: function(response) {
		sn_cs.VASystemObject.oneExtendErrored(response);
	},
	
	processCancelled: function(response) {
		sn_cs.VASystemObject.oneExtendCancelled(response);
	},

    type: 'VAOneExtendDefaultCallback'
};
