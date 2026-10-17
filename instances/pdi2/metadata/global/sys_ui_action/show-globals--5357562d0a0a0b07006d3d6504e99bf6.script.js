function onShowGlobals() {
    var spq = g_list.getQuery();
    var url = g_navigation.getURL();
    if (spq) {
        if (spq.indexOf('table=global') < 0) {
            url = 'sys_ui_action_list.do?sysparm_query=' + spq;
            var x = url.indexOf('table=');
            url = url.substring(0,x) + 'table=global^OR' + url.substring(x);
        }
    }
	g_navigation.open(url);
}
