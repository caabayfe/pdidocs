function migrateScheduledReport() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'migrateScheduledReportsToNextExperience');
    ga.addParam('sysparm_selected_scheduled_reports', g_list.getChecked());
	ga.getXML();
}
