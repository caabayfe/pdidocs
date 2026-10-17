function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	ScriptLoader.getScripts(['normalize_custom_ws_service_id.js'], function() {
		setServiceIdFromNewName(g_form, g_scratchpad, newValue);
	});
}

function setServiceIdFromNewName(form, scratchpad, newName) {
	var svcId = form.getValue('service_id');
	
	// If service_id is already set, we don't change it automatically here.
	if (svcId && svcId != '' && !form.isNewRecord())
		return;
	
	// If user chose a name, don't override it
	if (scratchpad.userSelectedServiceId == true)
		return;
	
	var newSvcId = normalizeServiceId(newName);
	
	var control = form.getControl('service_id');
	control.value = newSvcId;
}
