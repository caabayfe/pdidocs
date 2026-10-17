var ServiceMapUtility = Class.create();
ServiceMapUtility.prototype = {

	APP_SVC_BASE_CLASS: 'cmdb_ci_service_auto',

    initialize: function() {
		this.applicationServiceClass = new CMDBSet();
		this.applicationServiceClass.addAll(
			new GlideTableHierarchy(this.APP_SVC_BASE_CLASS).getTableExtensions());
		//getTableExtensions doesnt add the base class so adding explicitly
		this.applicationServiceClass.add(this.APP_SVC_BASE_CLASS);
		this.baseParametersForNodes = {
            "cmdb_ci": ["sys_class_name", "owned_by", "life_cycle_stage", "life_cycle_stage_status", "discovery_source", "last_discovered", "sys_updated_on", "location", "sys_created_on"],
            "cmdb_ci_service_discovered": ["busines_criticality"]
        };
        this.propertiesForFieldValues = ["sys_class_name", "location", "owned_by"];
    },

	isAnApplicationService: function(cmdbClass) {
		return global.JSUtil.notNil(cmdbClass) ? this.applicationServiceClass.has(cmdbClass) : false;
	},

	getCiApplicationServicesAssociation: function(ciSysIds) {
		return new global.ApplicationServiceGraphDataAPIs().getApplicationServicesAssociatedWithCi(ciSysIds, true);
	},

    getSMMap: function(args) {
        var tmpSMOutput = new ApplicationServiceGraphDTOTranslator().getGraphDTO({
			bsId: args.ciSysId,
			showLargeMap: false,
			level: args.traversalLimit,
			appId: args.appId,
			serviceMappingInput: args.serviceMappingInput,
			baseParametersForNodes: this.baseParametersForNodes,
			propertiesForFieldValues: this.propertiesForFieldValues,
			baseParametersForEdges: {},
			getIconFromClass: args.getIconFromClass
		});
		
        return tmpSMOutput;
    },
	
	//Pass in list of edges we need properties for and any additional properties
	getSMConnectionDetails: function(edgeList, additionalProperties) {
		var edgePropList =  new ApplicationServiceGraphDTOTranslator().getEdgeProperties(edgeList, additionalProperties);
		return edgePropList;
	},
	
    type: 'ServiceMapUtility'
};
