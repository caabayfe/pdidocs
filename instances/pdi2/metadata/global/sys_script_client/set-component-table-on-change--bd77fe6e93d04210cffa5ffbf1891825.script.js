function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'header_function') {
        g_form.setValue('component_table', 'sys_sg_applet_launcher');
    } else if (newValue == 'navigation_tab') {
        g_form.setValue('component_table', 'sys_sg_navigation_tab');
    } else if (newValue == 'prominent_action_button') {
        g_form.setValue('component_table', 'sys_sg_button_instance');
    }

}
