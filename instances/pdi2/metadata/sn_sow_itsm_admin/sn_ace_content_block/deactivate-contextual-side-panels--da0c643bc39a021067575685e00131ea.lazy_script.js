(function(context, pageParams, blockcontext) {
    var uxAppRouteGR = new GlideRecord('sys_ux_app_route');
    uxAppRouteGR.addQuery('sys_id', 'IN', blockcontext.selectedRecords);
    uxAppRouteGR.query();
    var screenTypeSysIds = [];
    while (uxAppRouteGR.next()) {
        screenTypeSysIds.push(uxAppRouteGR.getValue('screen_type'));
    }
    var uxScreenGR = new GlideRecord('sys_ux_screen');
    uxScreenGR.addQuery('screen_type', 'IN', screenTypeSysIds);
    uxScreenGR.query();
    uxScreenGR.setValue('active', false);
    uxScreenGR.updateMultiple();

    return {
        showDeactivateAlert: true,
        refreshList: JSON.stringify({
            'timestamp': new Date()
        }),
        selectedRecords: []
    };
})(context, pageParams, blockcontext);
