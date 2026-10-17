function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var field = 'template_condition';
    var message = getMessage("Template conditions are not supported in Core UI. Using these features will restrict your template to Workspace.");
    g_form.hideFieldMsg(field, true);
    g_form.showFieldMsg(field, message);
}
