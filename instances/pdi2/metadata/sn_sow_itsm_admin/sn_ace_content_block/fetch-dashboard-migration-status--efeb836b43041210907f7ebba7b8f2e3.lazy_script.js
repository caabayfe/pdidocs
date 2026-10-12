(function(context, pageParams, blockcontext) {
    var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
    var chartMigrationStatus = sowChartMigrationUtil.getChartMigrationStatus();
    var tier1MigrationStatus = chartMigrationStatus.tier1MigrationStatus;
    var tier2MigrationStatus = chartMigrationStatus.tier2MigrationStatus;

    var SN_SOW_ITSM_COMMON_SCOPE = "0eef12637311301045216238edf6a75e";
    var currentScope = gs.getCurrentApplicationId();

    var showChartsMigratedAlert = tier1MigrationStatus == "complete" && tier2MigrationStatus == "complete";
    return {
        showDifferentScopeAlert: currentScope !== SN_SOW_ITSM_COMMON_SCOPE && !showChartsMigratedAlert,
        tier1MigrationStatus: tier1MigrationStatus,
        tier2MigrationStatus: tier2MigrationStatus,
        showChartsMigratedAlert: showChartsMigratedAlert,
        showPreviewMigrationAlert: !showChartsMigratedAlert,
        showGeneralErrorAlert: sowChartMigrationUtil.hasErrors
    };
})(context, pageParams, blockcontext);
