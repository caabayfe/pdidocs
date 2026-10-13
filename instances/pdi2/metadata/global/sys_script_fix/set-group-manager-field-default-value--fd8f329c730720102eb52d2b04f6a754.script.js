updateDefaultGroupManagerField();

function updateDefaultGroupManagerField() {
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("cmn_rota_esc_step_def");
	gr.setWorkflow(false);
	gr.addNullQuery("group_manager_field");
	gr.setValue("group_manager_field", "manager");
	gr.updateMultiple();
}
