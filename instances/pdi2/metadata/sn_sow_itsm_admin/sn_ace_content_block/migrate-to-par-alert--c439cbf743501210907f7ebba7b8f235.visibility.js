var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
var chartMigrationStatus = sowChartMigrationUtil.getChartMigrationStatus();
answer = !(chartMigrationStatus.tier1MigrationStatus == "complete" && chartMigrationStatus.tier2MigrationStatus == "complete");
