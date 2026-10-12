function onSubmit() {
    var currentView = g_form.getViewName();
    var customFieldValue = g_form.getValue('pa_dm_kpi_configuration.formula');

    if (currentView.toLowerCase() === "formula" && customFieldValue.trim() === "") {
        g_form.addErrorMessage('The following mandatory fields are not filled in: Formula');
        return false;
    }
    return true;


}
