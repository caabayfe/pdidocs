(function executeRule(current, previous /*null when async*/) {

	var existing = new GlideRecord('sys_notification_actionable_prompt');
	existing.addQuery('notification', current.notification);
	existing.query();
	if (!existing.next())
		return;

	if (existing.getUniqueValue() == current.getUniqueValue())
		return;

	var msgArray = [existing.getUniqueValue()];
	gs.addInfoMessage(gs.getMessage('only 1 actionable prompt may be defined per notification: already exists id: {0}', msgArray));
	current.setAbortAction(true);
	
})(current, previous);
