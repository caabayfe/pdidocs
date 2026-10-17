function onSubmit() {
	//Type appropriate comment here, and begin script below
	var actionType = g_form.getValue('declarative_action_type');
	if (actionType === 'action_component' || actionType === 'dispatch_action')
		g_form.setValue('experience_restricted', false)
}
