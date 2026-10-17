function onLoad() {
	
	if (!g_form.isNewRecord()) {
		return;
	}
	
	var userScanVariableTypeSysId = "e72dcae25b6e101001fb0c370581c7b9";
	var sysAppScanVariableType = new GlideRecord("sys_app_scan_variable_type");
	if (sysAppScanVariableType.get(userScanVariableTypeSysId)) {
		g_form.setValue("type", userScanVariableTypeSysId);
	}

}
