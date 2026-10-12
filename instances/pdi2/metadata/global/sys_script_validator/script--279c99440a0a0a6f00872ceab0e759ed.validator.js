function validate(value) {
    if (g_form.getTableName() === 'sys_ui_script' || g_form.getTableName() === 'sys_script_client' || g_form.getTableName() === 'catalog_script_client')
        return true;

	if (g_form.getTableName() === 'sys_module') {
		var path = g_form.getValue('path');
		if (path && !path.endsWith(".js" ) && !path.endsWith(".ts"))
			return true;
	}

    var ajax = new GlideAjax('JSValidator');
    var scope = g_form.getValue('sys_scope');
    ajax.addParam('sysparm_name', 'validate');
    ajax.addParam('sysparm_js_expression', value);
    ajax.addParam('sysparm_scope', scope);
    ajax.addParam('sysparm_table', g_form.getTableName());
    ajax.addParam('sysparm_id', g_form.getUniqueValue());
    ajax.addParam('sysparm_use_es_latest', g_form.useEsLatest());
    ajax.getXMLWait();
    var answer = ajax.getAnswer();
    if (answer === null)
        return true;

    answer = getMessage("Could not save record because of a compile error: " + answer);
    return answer;
}
