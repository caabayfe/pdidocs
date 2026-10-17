function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var type = g_form.getValue("type");
    if (type == "DATE_TIME") {
        g_form.showFieldMsg("type", getMessage("Uses date time value from the actual record rather than the audit history and is displayed as a grouped node on the process map."));
    } else {
        g_form.hideFieldMsg("type");
    }
}
