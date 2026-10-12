function deleteNextExperienceDashboard() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'deleteNextExperienceDashboards');
    ga.addParam('sysparm_selected_dashboards_to_delete', g_list.getChecked());
	ga.getXML();
}
