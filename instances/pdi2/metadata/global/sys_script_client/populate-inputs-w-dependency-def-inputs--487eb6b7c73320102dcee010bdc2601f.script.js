function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue === undefined || newValue === null) {
        return;
	}

    var sysAppTemplateDependencyDefinition = new GlideRecord("sys_app_template_dependency_definition");
	if (!sysAppTemplateDependencyDefinition.get(newValue)) {
		return;
	}
	
	var depDefInput = sysAppTemplateDependencyDefinition.getValue("input");
	var depDefInputArr = depDefInput.split(",");
	var depDefInputJson = {};
	
	depDefInputArr.forEach(
		function(inputValue) {
			depDefInputJson[inputValue.trim()] = ""; 
		}
	);

	g_form.setValue("input", JSON.stringify(depDefInputJson));

}
