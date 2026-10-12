removeActionablePromptDemoRecord();

function removeActionablePromptDemoRecord() {
	if (pm.isZboot())
		return;

	var rec = new GlideRecord('sys_notification_actionable_prompt');
	if(rec.get("08aa5da30f0210105605539ac4767e8c")) {
		rec.deleteRecord();
	}
}
