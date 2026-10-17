function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === 'basic' && g_form.getReference('channel').type == 'phone') {
        g_form.setValue('automatic_link_enabled', true);
        return;
    }
}
