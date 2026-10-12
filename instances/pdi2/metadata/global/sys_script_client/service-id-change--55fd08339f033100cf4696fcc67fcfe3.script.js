function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	// if a new value was given by the user
	if (oldValue != newValue && newValue != '')
		g_scratchpad.userSelectedServiceId = true;
	else if (newValue == '') // else if the field was cleared by the user
		g_scratchpad.userSelectedServiceId = false;
	
	ScriptLoader.getScripts(['normalize_custom_ws_service_id.js'], function() {
		setServiceIdFromNewServiceId(g_form, g_scratchpad, newValue);
	});
}

function setServiceIdFromNewServiceId(form, scratchpad, value) {
	if (value == null || value == '') {
		// Value is empty. Try recreating from name.
		value = form.getValue('name');
	}
	
	var newSvcId = normalizeServiceId(value);
	
	var control = form.getControl('service_id');
	control.value = newSvcId;
}
