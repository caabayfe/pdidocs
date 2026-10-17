function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '') {
        g_form.setMandatory('assigned_entity', false);
        g_form.clearValue('assigned_entity');
        g_form.setDisabled('assigned_entity', true);
    } else {
        g_form.setMandatory('assigned_entity', true);
        if (!isLoading)
            g_form.clearValue('assigned_entity');
        g_form.setDisabled('assigned_entity', false);
    }
}
