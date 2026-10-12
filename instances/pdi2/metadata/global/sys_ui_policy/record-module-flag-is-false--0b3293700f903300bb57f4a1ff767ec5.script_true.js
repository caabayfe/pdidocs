function onCondition() {
	alert("record+ module flag is false");
	g_form.setVisible('table',true);
	g_form.setMandatory('table',true);	
	g_form.setVisible('module_flag',true);
	g_form.setMandatory('module_flag',true);
	g_form.setVisible('workspace_module',false);
	g_form.setMandatory('workspace_module',false);
	g_form.setVisible('custom_renderer',true);
	g_form.setMandatory('custom_renderer',true);
}
