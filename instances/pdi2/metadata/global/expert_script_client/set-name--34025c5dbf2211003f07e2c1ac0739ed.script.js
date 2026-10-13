function onChange(control, oldValue, newValue, isLoading) {
	var groupName = gel("sys_display.IO:39a2bc7cbf1211003f07e2c1ac073952").value;
	
	// give the schedule a name that is the same as the group name
	if((newValue != "" && g_form.getValue("name") == "")) {
		g_form.setValue("name", groupName);
	}
}
