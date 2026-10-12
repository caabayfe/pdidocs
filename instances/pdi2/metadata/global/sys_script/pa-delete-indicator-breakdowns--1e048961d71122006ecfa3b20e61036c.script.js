(function executeRule(current, previous /*null when async*/) {

	var indicator_breakdowns = new GlideRecord('pa_indicator_breakdowns');
	indicator_breakdowns.addQuery('breakdown', current.breakdown);
	indicator_breakdowns.addQuery('indicator.cube.facts_table', current.facts_table);
	
	indicator_breakdowns.query();
	indicator_breakdowns.deleteMultiple();		

})(current, previous);
