function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }
    var selectedInputType = g_form.getValue("input_source_choices");
    if (selectedInputType == "attachment") {
        g_form.setDisplay("attach_schema_file", true);
        g_form.setDisplay("json_schema_string", false);
    } else {
        g_form.setDisplay("json_schema_string", true);
        g_form.setDisplay("attach_schema_file", false);
    }

}
