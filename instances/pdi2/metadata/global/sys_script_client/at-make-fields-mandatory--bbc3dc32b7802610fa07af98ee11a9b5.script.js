function checkFieldMandatory() {
	var nonMandatoryInstallStatus = g_scratchpad.nonMandatoryInstallStatus;
	var mandatoryfields = g_scratchpad.formMandatoryFields;
	var fields = mandatoryfields[0];
	var mandatoryOnLoad = mandatoryfields[1];
	var hasMandatoryValue = false;
	for (var i = 0; i < fields.length; i++) {
		hasMandatoryValue = hasMandatoryValue || (g_form.getValue(fields[i]) !== '');
	}

	if (!hasMandatoryValue) {
		if (g_form.getValue('parent') === '' && !nonMandatoryInstallStatus.includes(g_form.getValue('install_status'))) {
			if (g_form.getValue('substatus') !== 'pre_allocated') {
				for (var j = 0; j < fields.length; j++) {
					g_form.setMandatory(fields[j], true);
				}
			}
		}
	} else {
		for (var k = 0; k < fields.length; k++) {
			g_form.setMandatory(fields[k], mandatoryOnLoad[k]);
			g_form.hideFieldMsg(fields[k]);
		}
	}
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	var tableName = g_form.getTableName();
	if (tableName !== 'alm_consumable' && tableName !== 'alm_license') {
		checkFieldMandatory();
	}
}
