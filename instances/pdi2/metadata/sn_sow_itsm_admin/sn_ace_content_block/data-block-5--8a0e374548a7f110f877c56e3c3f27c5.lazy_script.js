(function(context, pageParams, blockcontext){
    var selectedPlanName = "";
	var triggerRuleGR = new GlideRecord("major_incident_trigger_rule");
	triggerRuleGR.addQuery("sys_id", blockcontext.selectedRecords[0]);
    triggerRuleGR.query();
	if(triggerRuleGR.next()) {
        selectedTriggerRuleName = triggerRuleGR.getValue("name");
	}
    return {
        selectedTriggerRuleName: selectedTriggerRuleName,
        triggerRuleCopyName: gs.nil(selectedTriggerRuleName) ? "(empty) copy" : selectedTriggerRuleName + " copy"
    };
})(context, pageParams, blockcontext);
