function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var name = g_form.getValue('name');
	if (name && name != '' && !g_form.isNewRecord())
		return;
	
	var aj = new GlideAjax("TSConfigurationAjax");
	aj.addParam("sysparm_name", "getValidIndexGroupNameAjax");
	aj.addParam("sysparm_label", newValue);
	aj.addParam("sysparm_scope_name", g_scratchpad.scope);
	aj.getXML(function(response) {
		var name = response.responseXML.documentElement.getAttribute("answer");
		g_form.setValue("name", name);
	});
}
