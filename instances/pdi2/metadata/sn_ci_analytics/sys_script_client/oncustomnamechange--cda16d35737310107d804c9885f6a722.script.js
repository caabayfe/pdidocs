function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var scriptTemplate = "(function calc(sourceGr) {\r\n    /* Add your code here. */\r\n    return '';\r\n})(sourceGr);";
    var script = g_form.getValue('custom_name_script');
    if (script)
        g_form.setValue('custom_name_script', script);
    else
        g_form.setValue('custom_name_script', scriptTemplate);
}
