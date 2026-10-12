function onChange(control, oldValue, newValue, isLoading) {

    var table = new Table(g_form.getValue('target_table'));
    if (isLoading)
        newValue = oldValue;

    var el = table.getElement(newValue);
    var dateFormatEl = g_form.getValue('date_format');
    var displayChoiceAction = false;

    if (el && (el.type == "glide_date" || el.type == "glide_date_time" || el.type == "datetime" || el.type == "date")) {
        displayChoiceAction = true;
        if (!isLoading)
            g_form.setValue('date_format', 'yyyy-MM-dd HH:mm:ss');
    }

    if (el && el.type == "glide_time") {
        displayChoiceAction = true;
        if (!isLoading)
            g_form.setValue('date_format', 'HH:mm:ss');
    }

    g_form.setDisplay('date_format', displayChoiceAction);
}
