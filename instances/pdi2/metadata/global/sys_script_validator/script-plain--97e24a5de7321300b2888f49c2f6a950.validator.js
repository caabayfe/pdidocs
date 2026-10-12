function validate(value, fieldName) {
    if (!NOW.sp)
        return true;
    var validator = function(callback) {
        if (!value) {
            callback(fieldName, true);
            return;
        }

        // disable validation for certain tables
        var tableName = g_form.getTableName();
        if (tableName === 'sys_ui_script' || tableName === 'sys_script_client' || tableName === 'catalog_script_client' || tableName === 'sys_script_validator') {
            callback(fieldName, true);
            return;
        }

        var ajax = new GlideAjax('JSValidator');
        var scope = g_form.getValue('sys_scope');
        ajax.addParam('sysparm_name', 'validate');
        ajax.addParam('sysparm_js_expression', value);
        ajax.addParam('sysparm_scope', scope);
        ajax.addParam('sysparm_id', g_form.getUniqueValue());
        if (g_form.useEsLatest)
            ajax.addParam('sysparm_use_es_latest', g_form.useEsLatest());

        ajax.getXMLAnswer(function(answer) {
            if (answer === null) {
                callback(fieldName, true);
            } else {
                getMessage('Could not save record because of a compile error', function(trnsErrMsg) {
                    callback(fieldName, false, trnsErrMsg + ': ' + answer);
                });
            }
        });
    };

    var executor = g_ui_scripts['sp.validation.executor']();
    return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
