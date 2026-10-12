(function executeRule(current, previous /*null when async*/) {
	var maxQueryLimit = gs.getProperty('com.glide.pad.core.model.scheduledTrigger.maxQueryLimit', 1000);
	// Record based triggers do not have a limit field, but the WhenToRun filters for Scheduled Records Processing trigger type so we can expect it is available here.
	var limitFieldValue = parseInt((current.trigger_inputs.getVariablesRecord()).getValue("limit"));

	if (limitFieldValue > parseInt(maxQueryLimit)) {
		gs.addErrorMessage(gs.getMessage("Playbook scheduled trigger limit cannot exceed {0}.", [maxQueryLimit]));
		current.setAbortAction(true);
	}
})(current, previous);
