function transform(input) {
    var apiUtil = new sn_upgrade_mgmt.UpgradeManagementApiUtilOverview();
    return apiUtil.checkIfBulkAppUpdateInProgress();

}
