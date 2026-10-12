function setMandatoryByCondition(field, value) {
	var nonMandatoryInstallStatus = g_scratchpad.nonMandatoryInstallStatus;
	if (g_form.getValue('parent') === '' && !nonMandatoryInstallStatus.includes(g_form.getValue('install_status'))) {
		if (g_form.getValue('substatus') !== 'pre_allocated') {
			g_form.setMandatory(field, value);
		}
	}
}

function myCallBack(response) {
	var res = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
	var mandatoryField = [];
	var onLoadMandatory = [];
	var field = res[0];

	for (var i = 0; i < field.length; i++) {
		if (g_form.hasField(field[i]) && g_form.isVisible(field[i])) {
			mandatoryField.push(field[i]);
			if (field[i] === 'serial_number') {
				onLoadMandatory.push(g_scratchpad.default_MC_SN_mandatory);
			}
			if (field[i] === 'mac_addr' && g_form.hasField('mac_addr')) {
				onLoadMandatory.push(g_scratchpad.default_MC_MCADD_mandatory);
			}
			if (field[i] === 'asset_tag') {
				onLoadMandatory.push(g_scratchpad.default_MC_AT_mandatory);
			}
		}
	}

	g_form.setMandatory('serial_number', g_scratchpad.default_MC_SN_mandatory);
	g_form.setMandatory('asset_tag', g_scratchpad.default_MC_AT_mandatory);
	if (g_form.hasField('mac_addr')) {
		g_form.setMandatory('mac_addr', g_scratchpad.default_MC_MCADD_mandatory);
	}

	// set mandatory based on model category
	var hasMandatoryValue = false;
	for (var j = 0; j < mandatoryField.length; j++) {
		hasMandatoryValue = hasMandatoryValue || (g_form.getValue(mandatoryField[j]) !== '');
	}
	if (!hasMandatoryValue) {
		for (var k = 0; k < mandatoryField.length; k++) {
			setMandatoryByCondition(mandatoryField[k], true);
		}
	}
	g_scratchpad.formMandatoryFields = [mandatoryField, onLoadMandatory];
}

function checkMandatory(newValue, tableName) {
	var ga = new GlideAjax('global.AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'getMandatoryAttributes');
	ga.addParam('sysparm_model_category', newValue);
	ga.addParam('sysparm_table_name', tableName);
	ga.getXML(myCallBack);
}

function setDefaultMandatoryFields() {
	var mandatoryField = [];
	var onLoadMandatory = [];

	g_form.setMandatory('serial_number', g_scratchpad.default_MC_SN_mandatory);
	g_form.setMandatory('asset_tag', g_scratchpad.default_MC_AT_mandatory);
	if (g_form.hasField('mac_addr')) {
		g_form.setMandatory('mac_addr', g_scratchpad.default_MC_MCADD_mandatory);
	}

	if (g_scratchpad.default_MC_SN_mandatory) {
		mandatoryField.push('serial_number');
		onLoadMandatory.push(g_scratchpad.default_MC_SN_mandatory);
	}
	if (g_scratchpad.default_MC_AT_mandatory) {
		mandatoryField.push('asset_tag');
		onLoadMandatory.push(g_scratchpad.default_MC_AT_mandatory);
	}
	if (g_form.hasField('mac_addr') && g_scratchpad.default_MC_MCADD_mandatory) {
		mandatoryField.push('mac_addr');
		onLoadMandatory.push(g_scratchpad.default_MC_MCADD_mandatory);
	}

	g_scratchpad.formMandatoryFields = [mandatoryField, onLoadMandatory];
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var isUnknownModelCategory = false;
	if (typeof (g_scratchpad.isHAMActive) !== 'undefined' && g_scratchpad.isHAMActive) {
		isUnknownModelCategory = (oldValue === g_scratchpad.unknownModelCategorySysId);
	}
	var tableName = g_form.getTableName();
	if (tableName !== 'alm_consumable' && tableName !== 'alm_license'
		&& (g_form.isNewRecord() || isUnknownModelCategory)
		&& g_form.getValue('substatus') !== 'pre_allocated') {
		if (isLoading) {
			g_scratchpad.default_MC_SN_mandatory = g_form.isMandatory('serial_number');
			g_scratchpad.default_MC_AT_mandatory = g_form.isMandatory('asset_tag');
			if (g_form.hasField('mac_addr')) {
				g_scratchpad.default_MC_MCADD_mandatory = g_form.isMandatory('mac_addr');
			}
			if (newValue !== '') {
				checkMandatory(newValue, tableName);
			}
			return;
		}
		if (newValue === '') {
			setDefaultMandatoryFields();
			return;
		}
		checkMandatory(newValue, tableName);
	}
}
