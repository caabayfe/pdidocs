(function executeRule(current, previous /*null when async*/) {

	try {
		sn_flow_trigger.FlowTriggerAPI.createTimerTrigger(current);
	} catch (ex) {
		gs.error("Trigger Creation Error: " + ex);
		current.setAbortAction(true);
	}

})(current, previous);
