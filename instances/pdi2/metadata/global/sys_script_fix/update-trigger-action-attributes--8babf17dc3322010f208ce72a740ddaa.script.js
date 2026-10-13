(function() {
	if (pm.isZboot())
        return;
    var triggerRuleGR = new GlideRecord('sys_dictionary');
    triggerRuleGR.addQuery('name', 'trigger_rule');
    triggerRuleGR.addQuery('element', 'trigger_action');
    triggerRuleGR.query();
    if (triggerRuleGR.next()) {
        var gAttr = new GlideAttributes(triggerRuleGR.getValue('attributes'));
        gAttr.setAttribute('choice_script', 'new global.OnCallSecurityNG().getTriggerActionChoices()');
        triggerRuleGR.setValue('attributes', gAttr.serializeAttributes());
        triggerRuleGR.update();
    }
})();
