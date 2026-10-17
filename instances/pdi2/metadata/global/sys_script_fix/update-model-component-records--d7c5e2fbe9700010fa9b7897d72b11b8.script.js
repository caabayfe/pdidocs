updateRecords();
function updateRecords() {
	var model = new GlideRecord("cmdb_m2m_model_component");
	model.addNullQuery("component_parameter");
	model.setValue("component_parameter", "mandatory");
	model.setWorkflow(false);
	model.updateMultiple();
}
