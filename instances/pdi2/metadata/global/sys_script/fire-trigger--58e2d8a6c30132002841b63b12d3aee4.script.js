(function executeRule(current, previous /*null when async*/) {
	sn_flow_trigger.FlowTriggerAPI.fireTriggerMessage(current);
})(current, previous);
