var FilterDefinitionIds = Class.create();
FilterDefinitionIds.prototype = {
initialize: function() {},

getCapacityBasedDefinitionIds: function() {
    var capacityBasedDefinitionIds = [];
	var gr = new GlideRecord('license_details');
	gr.addQuery('license_type', 1);
	gr.query();
	
	while(gr.next()) {
		capacityBasedDefinitionIds.push(gr.getValue("quota_defn_id"));
	}
	return capacityBasedDefinitionIds;
},

type: 'FilterDefinitionIds'
};
