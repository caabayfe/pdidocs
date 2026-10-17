(function executeRule(current, previous /*null when async*/) {
	var existing = new GlideRecord('sys_kafka_namespace');
	if(existing.get("prefix", "")) {
		gs.addErrorMessage(gs.getMessage("Only one Kafka Namespace without a prefix may exist in the system"));
		current.setAbortAction(true);
	}
})(current, previous);
