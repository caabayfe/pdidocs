function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var screenFieldType = g_form.getValue('type');
    if (screenFieldType !== "script") return;

    if (g_form.isNewRecord() || g_form.getValue('execution_script').length === 0) {
        var SCRIPT_TEMPLATE = "(function generateScreenField(current) {" +
            "\r\n    //Type appropriate comment here, and begin script below\r\n\r\n})(current);" +
            "\r\n //current will point to the record in the record screen";
        g_form.setValue('execution_script', SCRIPT_TEMPLATE);
    }

}
