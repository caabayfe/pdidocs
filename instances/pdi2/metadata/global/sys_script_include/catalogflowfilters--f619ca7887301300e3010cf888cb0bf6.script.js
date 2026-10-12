var CatalogFlowFilters = Class.create();
CatalogFlowFilters.prototype = {
	initialize: function() {
	},

	getServiceCatalogFlows: function() {
		var flows = new global.FlowFiltersSNC().getFlowsByTriggerType("service_catalog");
		return "sys_idIN" + flows.join(",");	
	},

    type: 'CatalogFlowFilters'
};
