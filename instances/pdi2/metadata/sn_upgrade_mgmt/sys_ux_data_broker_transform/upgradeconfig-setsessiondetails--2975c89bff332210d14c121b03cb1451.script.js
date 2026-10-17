function transform(input) {
    const {
        functionName,
        sessionId,
        value
    } = input;

    const upgradeConfigFunctions = new Set([
        'getUpgradePlanState',
        'setUpgradePlanState',
        'mergeUpgradePlan',
        'createUpgradePlan'
    ]);

    const apiUtil = upgradeConfigFunctions.has(functionName) ?
        new sn_upgrade_mgmt.UpgradeManagementUpgradePlanUtil() :
        new global.UpgradeManagementApiUtil();

    return apiUtil[functionName](sessionId, value);
}
