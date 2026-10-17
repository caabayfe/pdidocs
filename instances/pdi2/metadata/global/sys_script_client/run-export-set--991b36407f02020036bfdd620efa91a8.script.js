function onLoad() {
	
	// don't export for new record
	if (g_form.isNewRecord())
		return;
	
	// don't export unless we have the right flag
	if ("1" != g_scratchpad.doexportdata && "1" != g_scratchpad.dotestexport20records)
		return;
	
	var sysId = gel('sys_uniqueValue').value;
	var name = g_form.getValue("name");
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("export_set_progress_dialog", false);
	dd.setPreference("sysparm_export_set_id", sysId);
	dd.setPreference("sysparm_export_set_name", name);
	
	if ("1" == g_scratchpad.dotestexport20records) {
		dd.setPreference("sysparm_export_set_test_mode", true);
		dd.setPreference("sysparm_export_set_action", "Test Export 20 Records");
	} else if ("1" == g_scratchpad.doexportdata) {
		dd.setPreference("sysparm_export_set_test_mode", false);
		dd.setPreference("sysparm_export_set_action", "Export Data");
	}
	
	dd.setWidth(500);
	dd.render();
}
