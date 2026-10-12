function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.getValue('entity') === '') {
        return;
    }
    var type = g_form.getValue("type") || '';
    if (type == 'PROPERTY' || type == 'CONTEXT') {
        var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
        gaProminUtil.addParam('sysparm_name', 'isValidFieldForFinding');
        gaProminUtil.addParam('sysparm_entityId', g_form.getValue('entity'));
        gaProminUtil.addParam('sysparm_tableName', g_form.getValue('table'));
        gaProminUtil.addParam('sysparm_selectedField', g_form.getValue("field"));
		gaProminUtil.addParam('sysparm_conditionType', g_form.getValue("type"));
        gaProminUtil.getXMLWait();
        var response = JSON.parse(gaProminUtil.getAnswer());

        var isValidField = response["isValid"];
        var message = response["errorMessage"];
        if (!isValidField) {
            g_form.addErrorMessage(message);
            g_form.clearValue("field");
            return false;
        }
    }

}
