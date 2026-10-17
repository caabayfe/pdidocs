(function executeRule(current, previous /*null when async*/) {

	var slaBreakdownDefinition = new SLABreakdownDefinition(current);

	if (current.sla_breakdown_table.changes())
		slaBreakdownDefinition.removeRelatedFields();

	if (current.task_table.changes()) {
		slaBreakdownDefinition.validateRelatedFields();
		slaBreakdownDefinition.removeRelatedSlaDefinitions();
	}

})(current, previous);
