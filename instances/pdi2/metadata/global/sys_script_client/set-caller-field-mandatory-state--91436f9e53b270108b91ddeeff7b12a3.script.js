function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (g_form.isNewRecord()) {
        var mandatory = (g_form.hasField('caused_by') && g_form.getValue('caused_by') != '') ? false : true;
        g_form.setMandatory('caller_id', mandatory);
        g_form.setMandatory('company', mandatory);
    }
}
