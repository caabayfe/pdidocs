function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    // reset the fileds and reload the form
    g_form.setValue('use_child_connection', false);
    g_form.setValue('connection_override', '');
    g_form.save();

}
