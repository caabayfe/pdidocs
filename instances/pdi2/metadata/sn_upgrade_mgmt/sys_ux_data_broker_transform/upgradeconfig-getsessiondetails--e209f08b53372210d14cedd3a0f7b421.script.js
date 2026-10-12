function transform(input) {
    const {
        functionName,
        sessionId
    } = input;

    const upgradeConfigFunctions = new Set([
        'getUpgradePlanState',
        'setUpgradePlanState',
        'createUpgradePlan'
    ]);

    const apiUtil = upgradeConfigFunctions.has(functionName) ?
        new sn_upgrade_mgmt.UpgradeManagementUpgradePlanUtil() :
        new global.UpgradeManagementApiUtil();

    return apiUtil[functionName](sessionId);
}
