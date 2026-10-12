(function executeRule(current, previous /*null when async*/) {
	//Get a copy of the record so not to interfere with current
	var chgScript = new ChangeRequest(current);
		
	if (chgScript.onHoldChanges()) {
		//Get a copy of the record so not to interfere with current
		var changeGR = new GlideRecord('change_request');
		changeGR.get(current.getUniqueValue());

		changeGR.setWorkflow(false);
		chgScript = new ChangeRequest(changeGR);
		chgScript.syncOnHoldTasks();
	} else if (!chgScript.onHoldChanges() && chgScript.onHoldReasonChanges())
		chgScript.updateOnHoldReason();
})(current, previous);
