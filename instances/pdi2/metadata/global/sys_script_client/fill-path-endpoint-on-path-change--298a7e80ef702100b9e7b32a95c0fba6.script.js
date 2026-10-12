function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	ScriptLoader.getScripts(['prefix_processor_scope.js'], function() {
		var scope = g_scratchpad.scope;
		scope = scope == 'global' ? '' : scope;

		var prefixedVal = prefixProcessorScope(newValue, scope);
		g_form.setValue("path_endpoint", prefixedVal);
	});
}
