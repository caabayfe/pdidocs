(function(context, pageParams, blockcontext) {
    var tier = pageParams.tierValue;
    var headerTitle = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "Donut Charts - Tier {tier} Agent", {
        tier: tier.toString()
    });
    var dropDownInfoText = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "This controls which dashboard is loaded when Tier {tier} Agents go to the SOW homepage", {
        tier: tier.toString()
    });
    var uxPagePropertyGR = new GlideRecord("sys_ux_page_property");
    if (tier == 1) {
        // sys_ux_page_property for tier1DefaultDashboard
        uxPagePropertyGR.get("d464758d47841210632ef855516d43ec");
    } else if (tier == 2) {
        // sys_ux_page_property for tier2DefaultDashboard
        uxPagePropertyGR.get("a301b58947841210632ef855516d4331");
    }
    var dashboardId;
    if (uxPagePropertyGR.isValidRecord()) {
        dashboardId = uxPagePropertyGR.getValue("value");
    }

    return {
        defaultDashboardId: dashboardId,
        tierValue: tier,
        disableSave: true,
        headerTitle: headerTitle,
        dropDownInfoText: dropDownInfoText
    };
})(context, pageParams, blockcontext);
