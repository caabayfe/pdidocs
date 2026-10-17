function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var variableName = g_form.getValue('name');
	
	if (variableName == '') {	
		var ga = new GlideAjax('CleanTemplateInputName');
		ga.addParam("sysparm_label", newValue);
		ga.addParam("sysparm_name", "createCleanName");
		ga.getXML(function (response) {
			var cleanVarName = response.responseXML.documentElement.getAttribute("answer");
			g_form.setValue('name', cleanVarName);
		});
	}
}
