function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading || newValue === '') {
		return;
	}
	
	var ajax = new GlideAjax("AssetUtilsAJAX");
	ajax.addParam("sysparm_name", "shouldUpdateDepreciationValues");
	ajax.addParam("sysparm_class", g_form.getTableName());
	ajax.getXML(updateDepreciationValues);
}

function updateDepreciationValues(response) {
	if (response.responseXML.documentElement.getAttribute('answer') === 'true') {
		var model = g_form.getReference('model', setDepreciation);
	}
}

function setDepreciation(model) {
	g_form.setValue('depreciation', model.depreciation);
	var ajax = new GlideAjax("AJAXCurrencyValues");
	ajax.addParam("sysparm_name", "getCurrencyValues");
	ajax.addParam("sysparm_table", "cmdb_model");
	ajax.addParam("sysparm_id", model.sys_id);
	ajax.addParam("sysparm_field", "salvage_value");
	ajax.getXML(readSalvageValue);
}

function readSalvageValue(response) {
	var items = response.responseXML.getElementsByTagName("values");
	for ( var i = 0; i < items.length; i++) {
		var item = items[i];
		var value = item.getAttribute("session_value");
		var currency = item.getAttribute("session_currency");
		var salvageDisplayValue = item.getAttribute("session_display");
	}
	g_form.setValue('salvage_value', currency + ';' + value, salvageDisplayValue);
	g_form.setValue('salvage_value.currency', currency);
}
