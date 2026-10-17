(function(context, pageParams, blockcontext) {
    var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
    if (blockcontext.areTier1DonutsCustomized) {
        var parUtils = new sn_dashboard_api.PARDashboardUtil();
        var SOW_UX_APP_ID = "aa881cad73c4301045216238edf6a716";
        try {
            var tier1PARDashboardConfig = JSON.parse(parUtils.getDashboard(sowChartMigrationUtil.ootbPARDashboardDetails["tier1"].sysId, SOW_UX_APP_ID));
        } catch (error) {
            gs.addErrorMessage(blockcontext.generalErrorMessage);
            gs.error("Configurable chart migration: Unable to parse Tier 1 PAR dashbaord confgiuration: {0}", error.toString());
            return {
                showGeneralErrorAlert: true,
                tier1MigrationStatus: "not-previewed"
            };
        }
        tier1PARDashboardConfig = sowChartMigrationUtil.getMigratedDashboardConfig(tier1PARDashboardConfig, "tier1", blockcontext.tier1Config);
        parUtils.editDashboard(sowChartMigrationUtil.ootbPARDashboardDetails["tier1"].sysId, JSON.stringify(tier1PARDashboardConfig));
    }

    sowChartMigrationUtil.updateTier1ChartMigartionStatus("previewed");

    return {
        showGeneralErrorAlert: false,
        tier1MigrationStatus: "previewed"
    };
})(context, pageParams, blockcontext);
