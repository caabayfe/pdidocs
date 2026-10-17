function openCreateChange() {
    var sys_id = g_form.getUniqueValue();
    var url = '/change_request.do';
    url += '?sys_id=-1&sysparm_query=cmdb_ci=' + sys_id;
    g_navigation.openPopup(url);
}
