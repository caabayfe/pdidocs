function onShowBothFormAndListActions() {
    var spq = g_list.getQuery();
    var url = g_navigation.getURL();
    spq = spq.replace(/\^form_action=true/g, '');
    spq = spq.replace(/form_action=true/g, '');
    spq = spq.replace(/\^list_action=true/g, '');
    spq = spq.replace(/list_action=true/g, '');
    url = 'sys_ui_action_list.do?sysparm_query=' + spq;
    g_navigation.open(url);
}
