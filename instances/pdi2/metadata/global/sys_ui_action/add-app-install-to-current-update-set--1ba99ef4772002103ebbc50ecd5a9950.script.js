function addAppInstall() {
	var sysIds = "";

	if (typeof g_list == "undefined") {
		sysIds = g_form.getUniqueValue();
	} else {
		if (g_list.getChecked().length > 0)
			sysIds = g_list.getChecked();
		else
			sysIds = rowSysId;
	}

	var gm = new GlideModal("update_set_app_install");
	gm.setTitle("Add App Install to Current Update Set");
	gm.setPreference("sysparm_sys_ids", sysIds);
	gm.setPreference("sysparm_table", "sys_app");
	gm.render();
}
