var CmdbReconciliationProcessor = Class.create();
CmdbReconciliationProcessor.prototype = {
    initialize: function() {
    },
	
	removeDotWalk : function(list) {
		var attrs = list.split(',');
		var left = [];
		
		for (var i in attrs)
		if (attrs[i].indexOf('.') == -1)
			left.push(attrs[i]);
		return left.join(',');
	},
	
	removeSysAndCmdbSpecificFields : function(list) {
		var abort = false;
		var attrs = list.split(',');
		var left = [];

		for (var i in attrs) {
			if (!(attrs[i].startsWith('sys_') || attrs[i] ==='first_discovered' || attrs[i] === 'last_discovered' || attrs[i] === 'discovery_source' || attrs[i] === 'duplicate_of')) {
				left.push(attrs[i]);
			}
		}

		if(typeof attrs !== "undefined") {
			if (left.length === 0) {
				gs.addInfoMessage(gs.getMessage("Discovery and System attributes are not allowed in reconciliation definition."));
				abort = true;
			}

			else if (left.length != attrs.length) {
				current.attributes = left.join();
				gs.addInfoMessage(gs.getMessage("System or invalid attributes have been skipped!"));
			}   
		}
		return abort;
	},

    type: 'CmdbReconciliationProcessor'
};
