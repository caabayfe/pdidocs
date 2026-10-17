function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

	var FLOW_ENGINE_DOT = 'flow_engine.';
    if (!newValue.startsWith(FLOW_ENGINE_DOT) && newValue.toLowerCase().startsWith(FLOW_ENGINE_DOT)) {
        g_form.setValue('queue', newValue.toLowerCase());
    }

}
