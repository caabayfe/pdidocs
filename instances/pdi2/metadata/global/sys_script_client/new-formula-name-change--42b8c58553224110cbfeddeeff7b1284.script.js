
			function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	var formulaName = newValue.replace(/[^a-zA-Z0-9_]/g, '_');
	// Compact any multiple sequential underscores
	while (formulaName.indexOf("__") != -1)
		formulaName = formulaName.replace(/__/g, "_");
	// Replace any trailing underscores
	while (formulaName != '' && formulaName.charAt(formulaName.length - 1) == '_')
		formulaName = formulaName.substring(0, formulaName.length - 1);
	// Remove any leading digits
	while (formulaName.length > 0 && formulaName.charAt(0) >= '0' && formulaName.charAt(0) <= '9')
		formulaName = formulaName.substring(1);
	control.value = formulaName;
	setInternalName(formulaName);
}
function setInternalName(formulaName) {
	if (formulaName == '')
		return;
	var scope = g_scratchpad.scope;
	scope = scope + '.';
	g_form.setDisabled("internal_name", false);
	g_form.setValue("internal_name", scope + formulaName);
	g_form.setValue("sys_name", scope + formulaName);
	g_form.setReadOnly("internal_name", true);
}
