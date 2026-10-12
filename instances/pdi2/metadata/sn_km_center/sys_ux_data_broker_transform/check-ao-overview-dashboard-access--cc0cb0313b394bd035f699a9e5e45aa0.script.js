function transform(input) {
    var output = {};
    var isAODashboardEligible = false;
    if (GlidePluginManager.isActive('sn_km_gen_ai')) {
        isAODashboardEligible = new sn_km_center.AOOverviewPageUIUtils().isAODashboardEligible();
    }
    output.isAODashboardEligible = isAODashboardEligible;
    return output;
}
