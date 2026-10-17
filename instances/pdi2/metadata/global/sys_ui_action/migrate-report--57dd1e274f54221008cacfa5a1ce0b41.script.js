function migrateReport() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'migrateReportsToNextExperience');
    ga.addParam('sysparm_selected_reports', g_list.getChecked());
	ga.getXML();
}
