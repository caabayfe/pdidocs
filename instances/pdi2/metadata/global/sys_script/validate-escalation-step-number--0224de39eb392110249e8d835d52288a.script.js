(function executeRule(current, previous /*null when async*/) {

	if (current.step < 1) {
		gs.addErrorMessage(gs.getMessage("Escalation step number cannot be less than 1"));
		current.setAbortAction(true);
	}

	var aggStepGr = new GlideAggregate("on_call_template_escalation_step");
	aggStepGr.addQuery("step", current.step);
	aggStepGr.addQuery("escalation_policy_template", current.escalation_policy_template);
	aggStepGr.addAggregate("COUNT");
	aggStepGr.query();

	if (aggStepGr.next() && aggStepGr.getAggregate("COUNT") > 0) {
		gs.addErrorMessage(gs.getMessage("Step with value {0} already exists.", current.step));
		current.setAbortAction(true);
	}

})(current, previous);
