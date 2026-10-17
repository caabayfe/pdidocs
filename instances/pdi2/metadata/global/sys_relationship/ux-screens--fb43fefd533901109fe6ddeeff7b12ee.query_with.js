(function refineQuery(current, parent) {
	var screenType = [];
    var appRouteGr = GlideRecord('sys_ux_app_route');
    appRouteGr.addQuery('extension_point', parent.sys_id);
    appRouteGr.query();
    while (appRouteGr.next()) {
        screenType.push(appRouteGr.getValue('screen_type'));
    }
    current.addQuery('screen_type', 'IN', screenType.join(","));

})(current, parent);
