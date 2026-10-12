function executeDiagnostic(id) {
	var result = [];
	var breakdownMap = new GlideAggregate('pa_breakdown_mappings');
	if (id)
		breakdownMap.addEncodedQuery('breakdownIN' + id, true);
	breakdownMap.addAggregate('COUNT');
	breakdownMap.groupBy('breakdown');
	breakdownMap.groupBy('facts_table');
	breakdownMap.query();
	while (breakdownMap.next()) {
		if (breakdownMap.getAggregate('COUNT') > 1) {
			result.push(breakdownMap.breakdown.toString());
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
