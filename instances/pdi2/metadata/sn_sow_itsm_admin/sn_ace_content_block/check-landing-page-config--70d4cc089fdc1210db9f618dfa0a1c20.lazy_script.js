(function(context, pageParams, blockcontext) {
    // return some_output
    var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
    var chartMigrationStatus = sowChartMigrationUtil.getChartMigrationStatus();
    var isTier1LandingPageMigrated = chartMigrationStatus.tier1MigrationStatus == 'complete';
    var isTier2LandingPageMigrated = chartMigrationStatus.tier2MigrationStatus == 'complete';
    return {
        "config_url_tier1": isTier1LandingPageMigrated ? "now/sow-admin/donut-configuration/1" : "sys_ux_client_script_include.do?sys_id=a1dcc9e7b77c3010e69dbc16de11a93b",
        "config_url_tier2": isTier2LandingPageMigrated ? "now/sow-admin/donut-configuration/2" : "sys_ux_client_script_include.do?sys_id=6ce083ce530301103eacddeeff7b1208"
    };
})(context, pageParams, blockcontext);
