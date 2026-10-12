function onLoad() {
   if (g_scratchpad.is_migration_running) {
	   g_form.addWarningMessage(g_scratchpad.migration_warning_msg);
   }
}
