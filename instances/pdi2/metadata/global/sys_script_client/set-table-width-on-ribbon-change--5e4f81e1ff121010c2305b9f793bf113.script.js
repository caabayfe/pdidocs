function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || !newValue)
		return;

	if (typeof g_scratchpad.ribbonTables[newValue] === 'undefined') {
		var ajax = new GlideAjax('RibbonConfigSettingAjax');
		ajax.addParam('sysparm_ribbon', newValue);
		ajax.getXML(ajaxResponse, null, newValue);
	}
	else
		updateTableAndWidth(newValue);
}

function ajaxResponse(response, newValue) {
	var ribbons = response.responseXML.getElementsByTagName('ribbon');
	if (ribbons.length > 0 && ribbons[0].getAttribute('is-valid') == 'true') {
		g_scratchpad.ribbonTables[newValue] = ribbons[0].getAttribute('table');
		g_scratchpad.ribbonWidths[newValue] = ribbons[0].getAttribute('width');
	}
	else
		g_scratchpad.ribbonTables[newValue] = '';
	updateTableAndWidth(newValue);
}

function updateTableAndWidth(newValue) {
	var ribbon_table = g_scratchpad.ribbonTables[newValue];
	if (ribbon_table) {
		if (g_form.getValue('table') != ribbon_table)
			g_form.setValue('table', ribbon_table);
		g_form.setValue('width', g_scratchpad.ribbonWidths[newValue]);
	}
}
