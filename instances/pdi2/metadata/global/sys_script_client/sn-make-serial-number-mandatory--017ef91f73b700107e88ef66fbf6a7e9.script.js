function myCallBack(response) {
	var res = response.responseXML.documentElement.getAttribute('answer');
	if (res === 'true') {
		g_form.setMandatory('serial_number', true);
	}
	g_scratchpad.MC_SN_checked = true;
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!g_form.isNewRecord()) {
		if (isLoading) {
			return;
		}
		var tableName = g_form.getTableName();
		if (tableName !== 'alm_consumable' && tableName !== 'alm_license'
            && newValue === '' && oldValue !== '' && g_form.getValue('ci') !== ''
            && g_scratchpad.MC_SN_checked !== true) {
			var ga = new GlideAjax('global.AssetUtilsAJAX');
			ga.addParam('sysparm_name', 'isSerialNumberMandatory');
			ga.addParam('sysparm_model_category', g_form.getValue('model_category'));
			ga.addParam('sysparm_table_name', tableName);
			ga.getXML(myCallBack);
		}
	}
}
