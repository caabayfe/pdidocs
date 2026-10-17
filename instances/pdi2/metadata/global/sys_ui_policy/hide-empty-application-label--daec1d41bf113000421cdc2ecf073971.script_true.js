function onCondition() {
	var appLabel = gel('sys_db_object.sys_app_file.sys_app_label');
	var emptyAppLabel = appLabel != null && (appLabel.value == null || appLabel.value.length == 0);
	g_form.setVisible('sys_app_file.sys_app', !emptyAppLabel);
}
