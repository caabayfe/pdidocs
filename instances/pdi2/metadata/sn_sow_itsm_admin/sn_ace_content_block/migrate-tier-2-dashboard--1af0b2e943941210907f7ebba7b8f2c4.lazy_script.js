(function(context, pageParams, blockcontext) {
    var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
    if (blockcontext.areTier2DonutsCustomized) {
        var parUtils = new sn_dashboard_api.PARDashboardUtil();
        var SOW_UX_APP_ID = "aa881cad73c4301045216238edf6a716";
        try {
            var tier2PARDashboardConfig = JSON.parse(parUtils.getDashboard(sowChartMigrationUtil.ootbPARDashboardDetails["tier2"].sysId, SOW_UX_APP_ID));
        } catch (error) {
            gs.error("Configurable chart migration: Unable to parse Tier 2 PAR dashbaord confgiuration: {0}", error.toString());
            return {
                showGeneralErrorAlert: true,
                tier2MigrationStatus: "not-previewed"
            };
        }
        tier2PARDashboardConfig = sowChartMigrationUtil.getMigratedDashboardConfig(tier2PARDashboardConfig, "tier2", blockcontext.tier2Config);
        parUtils.editDashboard(sowChartMigrationUtil.ootbPARDashboardDetails["tier2"].sysId, JSON.stringify(tier2PARDashboardConfig));
    }

    sowChartMigrationUtil.updateTier2ChartMigartionStatus("previewed");

    return {
        showGeneralErrorAlert: false,
        tier2MigrationStatus: "previewed"
    };
})(context, pageParams, blockcontext);
