function onLoad() {
	var actionModel = g_form.getValue('model');
	//hide value for non values
	if (actionModel === '035d270073151010c342d5fdbdf6a715'){
		g_form.removeOption('declarative_action_type', 'dispatch_action');
		g_form.removeOption('declarative_action_type', 'action_component');
	}
}
