function transform(input) {
  const { functionName, sessionId, selectedRecords, exceptedRecords } = input;

  const upgradeATFFunctions = new Set([
    'moveRecordsToUpgradeTable',
    'moveRecordToUpgradeTable',
    'deleteRecordFromUpgradeTable',
    'startTestGenerator',
    'getBoqState',
    'getTestSuiteId',
    'getAgenticState',
    'freeBoqFromSession',
    'getPostTestingStatus',
    'setAgenticState',
    'getPreTestingStatus',
    'cancelTestGenerator',
    'statusTestGenerator',
    'runTestSuites',
    'runCICDTestSuite',
    'getCICDProgress',
    'runSelectedTestSuites'
  ]);

  const apiUtil = upgradeATFFunctions.has(functionName)
    ? new sn_upgrade_mgmt.UpgradeManagementATFUtil()
    : new global.UpgradeManagementApiUtil();

    return apiUtil[functionName](sessionId, selectedRecords, exceptedRecords);
}
