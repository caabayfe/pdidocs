
(function(context, pageParams, blockcontext) {
    var triggerRuleName = gs.getMessage("New trigger rule");
    var triggerRuleGR = new GlideRecord("major_incident_trigger_rule");
    if (triggerRuleGR.get("sys_id", pageParams.triggerRuleSysId)) {
        triggerRuleName = triggerRuleGR.getValue("name");
    }
    return {
        triggerRuleName: triggerRuleName
    };
})(context, pageParams, blockcontext);
