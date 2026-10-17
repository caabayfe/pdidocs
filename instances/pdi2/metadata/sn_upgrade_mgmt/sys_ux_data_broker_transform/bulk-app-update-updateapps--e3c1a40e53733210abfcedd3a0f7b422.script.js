function transform(input) {
    const {
        functionName,
        sessionId
    } = input;
    const updateBulkApp = new Set([
        'getNewInstallAppCounts',
        'scheduleBatchInstallFromUpgradePlan',
        'deleteScheduleInstall',
        'installAppsFromUpgradePlan'
    ]);

    if (!updateBulkApp.has(functionName)) {
        gs.error('Bulk App Update: Disallowed or missing functionName: ' + functionName);
        return null;
    }
    const apiUtil = new sn_upgrade_mgmt.BulkUpdateAppUtils();

    return apiUtil[functionName](sessionId);
}
