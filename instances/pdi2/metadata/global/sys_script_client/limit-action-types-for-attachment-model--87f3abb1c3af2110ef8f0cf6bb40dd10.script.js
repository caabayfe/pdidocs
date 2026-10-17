function onLoad() {
    var actionModel = g_form.getValue('model');
    //hide value for non values
    if (actionModel === '6435586043602110ca7757d2cbb8f286') {
		g_form.removeOption('declarative_action_type', 'dispatch_action');
		g_form.removeOption('declarative_action_type', 'action_component');
    }
}
