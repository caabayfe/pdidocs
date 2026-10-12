function reinstallApp() {  // note: canRead() => Admin...  and current.isValidRecord()
    var sysId = g_form.getUniqueValue();
	var dd = new GlideModal("sn_appclient_install_or_update_app");
	dd.setTitle('Repair Application');//will be replaced with translation
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setPreference('sysparm_app_name', g_form.getValue("name"));
	dd.setPreference('sysparm_app_description', g_form.getValue("short_description"));
	dd.setPreference('sysparm_demo_data', g_form.getValue("demo_data")!='no_demo_data');
	dd.setPreference('sysparm_isConfirmation',true);
	dd.setWidth(450);
	dd.render();
	getMessage('Repair Application', updateTitle);

	function updateTitle(msg) {
		dd.setTitle(msg);
	}
}
