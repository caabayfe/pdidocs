function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.setDisplay('client_script', newValue === 'inline');
    g_form.setDisplay('url', newValue === 'url');
    g_form.setDisplay('sys_ui_script', newValue === 'ui_script');
}
