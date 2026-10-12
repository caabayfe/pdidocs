function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || newValue == oldValue)
		return;
	
	var clean = cleanScope(newValue);
	if (clean != newValue) {
		g_form.setValue("scope", cleanScope(newValue));
		g_form.flash("scope", "rgb(229, 255, 229)", 2);
	}
}

function cleanScope(prefix) {
	var scope = prefix.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	
	// Compact any multiple sequential underscores
	while (scope.indexOf("__") != -1)
		scope = scope.replace(/__/g, "_");
	
	// Replace any trailing underscores
	while (scope != '' && scope.charAt(scope.length - 1) == '_')
		scope = scope.substring(0, scope.length - 1);
	
	return scope;
}
