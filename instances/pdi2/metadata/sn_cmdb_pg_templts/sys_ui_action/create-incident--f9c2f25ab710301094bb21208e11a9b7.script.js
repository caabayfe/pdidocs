function goToCreateIncident() {
    var sys_id = g_form.getUniqueValue();
    var url = '/incident.do';
    url += '?sys_id=-1&sysparm_query=cmdb_ci=' + sys_id;
    g_navigation.openPopup(url);
}
