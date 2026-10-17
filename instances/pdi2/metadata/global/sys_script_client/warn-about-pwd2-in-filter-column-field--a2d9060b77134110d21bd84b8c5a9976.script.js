function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var column = g_form.getValue("filter_column");
    var table = g_form.getValue("target_table");
    var glideAjax = new GlideAjax("global.SMGlobal");
    glideAjax.addParam("sysparm_name", "isPwd2Field");
    glideAjax.addParam("sysparm_table", table);
    glideAjax.addParam("sysparm_column", column);
    glideAjax.getXML(callback);

    function callback(response) {
        var isPwd2 = response.responseXML.documentElement.getAttribute("answer");
        if (isPwd2 == "true")
            g_form.showFieldMsg("filter_column", getMessage("Password2 fields cannot be used for the filter column"), "error");
    }

}
