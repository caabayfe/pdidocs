function onClick(){
	if (typeof g_ui_scripts != 'undefined') {
        g_ui_scripts.getUIScript('SkippedRecordRuleEngineUtils').then(callAPI);
    } else if (typeof ScriptLoader != 'undefined') {
        ScriptLoader.getScripts('SkippedRecordRuleEngineUtils.jsdbx', callAPI);
    }
}

function callAPI(scriptName) {
    if (!scriptName) {
        scriptName = SkippedRecordRuleEngineUtils;
    }
    scriptName().runActiveRulesOnGivenUpgradeHistoryId(g_form.getUniqueValue());
}
