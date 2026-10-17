(function(context, pageParams, blockcontext) {
    var uxPagePropertyGR = new GlideRecord("sys_ux_page_property");

    if (blockcontext.tierValue == 1) {
        // sys_ux_page_property for tier1DefaultDashboard
        uxPagePropertyGR.get("d464758d47841210632ef855516d43ec");

    } else if (blockcontext.tierValue == 2) {
        // sys_ux_page_property for tier2DefaultDashboard
        uxPagePropertyGR.get("a301b58947841210632ef855516d4331");
    }
    if (uxPagePropertyGR.isValidRecord()) {
        uxPagePropertyGR.setValue("value", blockcontext.newDefaultDashboardSelection.sysId);
        uxPagePropertyGR.update();
    }

    return {
        showSavedAlert: true,
        defaultDashboardId: blockcontext.newDefaultDashboardSelection.sysId
    };
})(context, pageParams, blockcontext);
