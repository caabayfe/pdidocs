function migrateFilter() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'migrateFiltersToNextExperience');
    ga.addParam('sysparm_selected_filters', g_list.getChecked());
	ga.getXML();
}
