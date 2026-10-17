(function executeRule(current, previous /*null when async*/) {
	if (previous && previous.ci_item.nil() && current.ci_item.nil())
		return; // do not calculate if CI is null and was previously null

	// ci_item already updated in cmdb_ci_outage business rule
	if (current.ci_item.toString() === current.outage.cmdb_ci.toString())
		return;
			
	var currentData = {
		cmdb_ci: current.ci_item,
		outage: current.outage
	};
	var previousData = {
		cmdb_ci: previous ? previous.ci_item : null,
		outage: previous ? previous.outage : null,
	};
	
	new global.RecalculateAvailability().processOutageChange(currentData, previousData, current.operation());
})(current, previous);
