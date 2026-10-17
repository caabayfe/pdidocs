function onSubmit() {
    var currentView = g_form.getViewName();
    var customFieldValue = g_form.getValue('pa_datasnapshot_indicator.formula');

    if (currentView.toLowerCase() === "formula" && customFieldValue.trim() === "") {
        g_form.addErrorMessage(getMessage('The following mandatory fields are not filled in: Formula'));
        return false;
    }
    return true;


}
