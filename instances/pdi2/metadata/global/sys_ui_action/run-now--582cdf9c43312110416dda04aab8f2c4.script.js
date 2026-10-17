ScriptLoader.getScripts('SkippedRecordRuleEngineUtils.jsdbx', function() {});

function callAPI() {
    var sClient = new SkippedRecordRuleEngineUtils();
    sClient.runSelectedActiveRulesOnLastUpgrade();
}
