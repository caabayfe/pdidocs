updateColumnAttributes();
function updateColumnAttributes() {
	if (pm.isZboot())
		return;
	updateIDCalculation();
	updateIDHint();
	updatePostProcessScriptLabelAndHint();
}

function updatePostProcessScriptLabelAndHint() {
	var gr = new GlideRecord("sys_documentation");
	gr.addQuery("name", "sys_alias_templates");
	gr.addQuery("element", "post_process_script");
	gr.query();
	if (gr.next()) {
		gr.setValue("label", "On Create Script");
		gr.setValue("plural", "On Create Scripts");
		gr.setValue("hint", "Connection and Credential creation script");
		gr.setWorkflow(false);
		gr.update();
	}
}

function updateIDHint() {
	var gr = new GlideRecord("sys_documentation");
	gr.addQuery("name", "sys_alias");
	gr.addQuery("element", "id");
	gr.query();
	if (gr.next()) {
		gr.setValue("hint", "Calculated field with format: scope name and handle name. Non-alphanumeric characters are replaced with underscores");
		gr.setWorkflow(false);
	gr.update();
	}
}

function updateIDCalculation() {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_alias");
	gr.addQuery("element", "id");
	gr.query();
	if(gr.next()) {
		gr.setValue("calculation", "if (current.name) {current.id = (current.sys_scope.scope != 'global') ? current.sys_scope.scope + '.' + current.name.replace(/[^A-Za-z0-9_]/g, '_') : current.name.replace(/[^A-Za-z0-9_]/g, '_');}");
		gr.setWorkflow(false);
		gr.update();
	}
}
