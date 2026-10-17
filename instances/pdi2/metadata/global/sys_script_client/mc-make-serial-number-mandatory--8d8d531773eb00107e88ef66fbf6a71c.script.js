function myCallBack(response) {
	var res = response.responseXML.documentElement.getAttribute('answer');
	if (res === 'true') {
		g_form.setMandatory('serial_number', true);
	} else {
		g_form.setMandatory('serial_number', false);
	}
}

function checkSerialNumberNeedMandatory(newValue, tableName) {
	var ga = new GlideAjax('global.AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'isSerialNumberMandatory');
	ga.addParam('sysparm_model_category', newValue);
	ga.addParam('sysparm_table_name', tableName);
	ga.getXML(myCallBack);
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
			if (!g_scratchpad.default_MC_SN_mandatory && newValue !== '') {
				checkSerialNumberNeedMandatory(newValue, tableName);
			}
			return;
		}
		if (newValue === '') {
			return;
		}
		if (!g_scratchpad.default_MC_SN_mandatory) {
			checkSerialNumberNeedMandatory(newValue, tableName);
		}
	}
}
