var CancelBSDiscovery = Class.create();
CancelBSDiscovery.prototype = {
	initialize: function() {
	},
	
	cancelAll: function(bs_id) {
		var cancel = new SwBSDiscoveryCancel();
		cancel.cancelAll(bs_id);
	},		
		
	type: 'CancelBSDiscovery'
};
