updateDefaultTriggerRuleUserGroupFields();

function updateDefaultTriggerRuleUserGroupFields() {
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("trigger_rule");
	gr.addNullQuery("trigger_group_assigned");
	gr.addNullQuery("trigger_when");
	gr.setValue("trigger_group_assigned", false);
	gr.setValue("trigger_when", "condition_matches");
	gr.updateMultiple();
}
