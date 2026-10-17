function migrateDashboard() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'migrateDashboardsToNextExperience');
    ga.addParam('sysparm_selected_dashboards', g_list.getChecked());
	ga.getXML();
}
