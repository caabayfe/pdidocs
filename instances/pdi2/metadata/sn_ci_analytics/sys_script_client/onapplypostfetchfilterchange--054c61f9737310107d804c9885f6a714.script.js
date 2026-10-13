function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var scriptTemplate = "(function isValid(sourceGr) {\r\n    /* Add your code here. */\r\n    return '';\r\n})(sourceGr);";
    var script = g_form.getValue('post_fetch_filter');
    if (script)
        g_form.setValue('post_fetch_filter', script);
    else
        g_form.setValue('post_fetch_filter', scriptTemplate);
}
