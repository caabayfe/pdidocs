function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var ga = new GlideAjax('AdminConsoleAjaxUtility');
    ga.addParam('sysparm_name', 'getIARfields');
    ga.addParam('sysparm_value', newValue);
    ga.getXML(process);
}

function process(response) {
    var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
    if (result.target_table_name) {
        g_form.setValue('target_table', result.target_table_name);
    }
	if (result.condition) {
		setTimeout((function () {
			g_form.setValue('record_set', result.condition);
		}), 1000);
        g_form.clearValue("record_set");
    }
}
