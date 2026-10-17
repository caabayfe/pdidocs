function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading)
		return;

	if (newValue == '' || newValue == null) {
		g_form.setValue('location', '');
		return;
	}

	if (!g_form.hasField('location'))
		return;

	var caller = g_form.getReference('caller_id', setLocation);



	function setLocation(caller) {
		if (caller)
			g_form.setValue('location', caller.location);
	}
}
