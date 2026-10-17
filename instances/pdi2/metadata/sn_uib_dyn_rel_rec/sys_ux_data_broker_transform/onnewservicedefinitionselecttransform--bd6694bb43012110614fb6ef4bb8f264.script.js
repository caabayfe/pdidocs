function transform(input) {
    if (!(GlidePluginManager.isActive("com.snc.csm_case_types") && new sn_csm_case_types.CaseTypeHelper().isServiceDefinitionSelectionEnabled()))
        return false;
	if (input.table) {
        // Check if the current user has read access to the table
        if (!(new GlideRecord(input.table).canRead())) {
            return false;
        }
		//hardcode for case task tables only
		var tableHierarchy = new GlideTableHierarchy(input.table);
		if (tableHierarchy.getHierarchy().indexOf("sn_customerservice_task") === -1) {
			return false;
		}
		return new sn_csm_case_types.CaseTypeHelper().hasServiceDefinitionSelectionDefined(input.table);
	}
	else
		return false;
	
}
