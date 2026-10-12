function RollbackDashboard() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'rollback');
    ga.addParam('sysparm_selected_dashboards', g_list.getChecked());
    ga.getXML();
}
