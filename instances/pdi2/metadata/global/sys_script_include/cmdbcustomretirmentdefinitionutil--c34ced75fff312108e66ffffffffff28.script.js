var CMDBCustomRetirmentDefinitionUtil = Class.create();
	CMDBCustomRetirmentDefinitionUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

		DEFAULT_POLICY_TABLE : "cmdb_ci",
		RETIREMENT_CUSTOM_DEFINITION_TABLE : "cmdb_retirement_custom_definitions",
		ACTIVE : 'active',
		TABLE_COL : 'table',
		TRUE : "true",
		SYS_ID : "sys_id",

	    // Function to delete a retirement definition record by sys_id
	    deleteRetirementDefinition: function() {
		if (!gs.hasRole('sn_cmdb_admin') && !gs.hasRole('data_manager_admin')) {
			return false;
		}
		var sysId = this.getParameter('definition_sys_id');
		if (!sysId) {
		    return false;
		}
	
		var retirementDefinitionsGr = new GlideRecord(this.RETIREMENT_CUSTOM_DEFINITION_TABLE);
        	if (retirementDefinitionsGr.get(sysId) && retirementDefinitionsGr.canDelete()) {
		    var deleted = retirementDefinitionsGr.deleteRecord();
		    return deleted ? true : false;
		}
	
		return false;
	    },
	
	    // Function to check if the current record is the last retirement definition (excluding cmdb_ci)
	    isLastButOneRetirementDefinition: function() {
		if (!gs.hasRole('sn_cmdb_admin') && !gs.hasRole('data_manager_admin')) {
			return false;
		}
		var definitionId = this.getParameter('definitionId');
			
		if (!definitionId) {
		    return false;
		}
		
		var retirementDefinitionsGr = new GlideRecord(this.RETIREMENT_CUSTOM_DEFINITION_TABLE);
		retirementDefinitionsGr.addQuery(this.SYS_ID, '!=', definitionId);
		retirementDefinitionsGr.addQuery(this.TABLE_COL, '!=', this.DEFAULT_POLICY_TABLE);
		retirementDefinitionsGr.query();
        	return !retirementDefinitionsGr.hasNext(); // Returns true if no other records exis
	
	    },
	
	    // Function to activate default retirement definition
	    activateDefaultRetirementDefnition: function() {
		if (!gs.hasRole('sn_cmdb_admin') && !gs.hasRole('data_manager_admin')) {
			return false;
		}
		var retirementDefinitionsGr = new GlideRecord(this.RETIREMENT_CUSTOM_DEFINITION_TABLE);
		retirementDefinitionsGr.addQuery(this.TABLE_COL, "=", this.DEFAULT_POLICY_TABLE);
		retirementDefinitionsGr.query();
        	if (retirementDefinitionsGr.next() && retirementDefinitionsGr.canWrite()) {
		    retirementDefinitionsGr.active = true; 
		    retirementDefinitionsGr.update(); 
		    return true; // Return true if the update was successful
		}
		return false; // Return false if the record was not found
	    },
	
	    type: 'CMDBCustomRetirmentDefinitionUtil'
});
