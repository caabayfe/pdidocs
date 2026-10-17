function migratePAWidget() {
    var ga = new GlideAjax('global.MigrateDashboardAjax');
    ga.addParam('sysparm_name', 'migratePAWidgetsToNextExperience');
    ga.addParam('sysparm_selected_pa_widgets', g_list.getChecked());
    ga.getXML();
}
