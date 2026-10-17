function onLoad() {
    //Type appropriate comment here, and begin script below
	var location = g_form.getValue('location');
    if (location == 'header_function') {
        g_form.setValue('component_table', 'sys_sg_applet_launcher');
    } else if (location == 'navigation_tab') {
        g_form.setValue('component_table', 'sys_sg_navigation_tab');
    } else if (location == 'prominent_action_button') {
        g_form.setValue('component_table', 'sys_sg_button_instance');
    }

}
