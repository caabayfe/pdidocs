function onLoad() {
	var model = g_form.getValue('model');
    if (model == 'e48b12c02d559110f8778479e97d46f0') {
        g_form.removeOption('declarative_action_type', 'dispatch_action');
        g_form.removeOption('declarative_action_type', 'action_component');
        g_form.removeOption('declarative_action_type', 'server_script');

	g_form.removeOption('button_type', 'tertiary');

    }
   
}
