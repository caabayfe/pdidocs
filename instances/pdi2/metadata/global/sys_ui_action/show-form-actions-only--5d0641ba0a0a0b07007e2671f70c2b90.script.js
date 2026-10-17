function onShowFormActionsOnly() {
    var spq = g_list.getQuery();
    var url = g_navigation.getURL();
    spq = spq.replace(/\^list_action=true/g, '');
    spq = spq.replace(/list_action=true/g, '');
    if (spq)
        spq = spq + '^';
    url = 'sys_ui_action_list.do?sysparm_query=' + spq + 'form_action=true';
	g_navigation.open(url);
}
