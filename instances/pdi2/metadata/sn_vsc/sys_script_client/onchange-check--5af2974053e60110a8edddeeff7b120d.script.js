function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    if (newValue == "") {
        g_form.setValue('table_check', "");
        g_form.setValue('column_check', "");
		return;
    }
    var ga = new GlideAjax('VSCScanAjaxProcessor');
    ga.addParam('sysparm_name', 'getCheckTable');
    ga.addParam('sysparm_sys_id', newValue);
    ga.getXML(getCheckType);

    function getCheckType(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer == "scan_table_check") {
            g_form.setValue('table_check', newValue);
        } else if (answer == "scan_column_type_check") {
            g_form.setValue('column_check', newValue);
        } else {
            g_form.setValue('table_check', "");
            g_form.setValue('column_check', "");
        }


    }
}
