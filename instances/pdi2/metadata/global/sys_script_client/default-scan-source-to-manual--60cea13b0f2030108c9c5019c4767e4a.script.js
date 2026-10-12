function onLoad() {
	// When user clicks the "new" button on the sys_app_scan_variable table, defaults the "scan_source" column to manual.
	if (g_form.isNewRecord())
		g_form.setValue('scan_source', 'manual');
}
