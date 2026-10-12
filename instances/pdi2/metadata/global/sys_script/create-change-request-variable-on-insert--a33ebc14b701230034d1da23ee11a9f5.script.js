(function executeRule(current, previous /*null when async*/) {
	var decisionInput = new GlideRecord("sys_decision_input");
	decisionInput.initialize();
	decisionInput.internal_type = "reference";
	decisionInput.label = "Change request";
	decisionInput.column_label = "change_request";
	decisionInput.reference = "change_request";
	decisionInput.model = current.getUniqueValue();
	decisionInput.model_id = current.getUniqueValue();
	decisionInput.insert();
})(current, previous);
