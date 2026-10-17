function onHideGlobals() {
    var spq = g_list.getQuery();
    var url = g_navigation.getURL();
    if (spq) {
        if (spq.indexOf('table=global^OR') >= 0) {
            spq = spq.replace(/table=global\^OR/g, '');
            url = 'sys_ui_action_list.do?sysparm_query=' + spq;
        }
    }
	g_navigation.open(url);
}
