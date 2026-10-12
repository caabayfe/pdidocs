var UnifiedMapHelper = Class.create();
UnifiedMapHelper.prototype = {

    initialize: function() {},
	
	getMap: function(args) {
		return (new MapService()).getMap(args);
	},
   
	getCiDetails: function(args) {
		return (new MapService()).getCiDetails(args);
	},

	//retrieve SM connection details
	getSMConnectionDetails: function(edges, additionalProps) {
		return (new MapService()).getSMConnectionDetails(edges, additionalProps);
	},

	//retrieve group members associated with the dynamic CI group
	getDynamicCiGroupMembers: function(args) {
		return (new MapService()).getDynamicCiGroupMembers(args);
	},
	
	//retrieve related item list
	getRelatedList: function(workspaceId, configIdentifierId) {
		return (new MapRelatedItemService()).getRelatedList(workspaceId, configIdentifierId);
	},

	//retrieve all related item categories
	getRelatedItemCategories: function(workspaceId, configIdentifierId) {
		return (new MapRelatedItemService()).getRelatedItemCategories(workspaceId, configIdentifierId);
	},


	//retrieve related item list aggregate count
	getRelatedListAggregate: function(cmdbCis, relTableObjs){
		return (new MapRelatedItemService()).getRelatedListAggregate(cmdbCis, relTableObjs);
	},

	//retrieve the given related table details
	getRelatedItemData: function(config) {
		return (new MapRelatedItemService()).getRelatedItemData(config);
	},

	//retrieve the related application services
	getRelatedApplicationServices: function(ciSysIds) {
		return (new MapService()).getRelatedApplicationServices(ciSysIds);
	},

	//get property/properties based on defined config
	getConfigPropertyValues: function(args) {
		return (new MapService()).getConfigPropertyValues(args);
	},

	//get property/properties based on defined config
	getSuggestedRelationshipsByCi: function(args) {
		return (new MapService()).getSuggestedRelationshipsByCi(args);
	},
    type: 'UnifiedMapHelper'
};
