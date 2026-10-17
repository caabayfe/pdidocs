function convertHomepagesToDashboards() {
    var ga = new GlideAjax('global.ConvertHomePagesAjax');
    ga.addParam('sysparm_name', 'convertHomepagesToDashboards');
    ga.addParam('sysparm_selected_homepages', g_list.getChecked());
    ga.getXML();
}
