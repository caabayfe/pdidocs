function canWrite (variable) {
	var modelTable = new GlideRecord("sys_flow_cat_variable_model");
	if (!modelTable.get(variable.flow_catalog_model))
		return true;
	
	var flow = new GlideRecord("sys_hub_flow");
	if (!flow.get(modelTable.id))
		return true;
	
	return flow.canWrite();
}	

canWrite(current);
