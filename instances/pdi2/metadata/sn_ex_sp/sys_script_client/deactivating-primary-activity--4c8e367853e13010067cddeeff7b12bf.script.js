function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue === 'false') {
        var isPrimary = g_form.getValue('primary');
        if (isPrimary === 'true') {
            var answer = confirm(getMessage('Deactivating this activity will also remove it as a primary activity.'));
            if (answer) {
                g_form.setValue('primary', false);
                g_form.save();
            } else
                g_form.setValue('active', true);
        }
    }

}
