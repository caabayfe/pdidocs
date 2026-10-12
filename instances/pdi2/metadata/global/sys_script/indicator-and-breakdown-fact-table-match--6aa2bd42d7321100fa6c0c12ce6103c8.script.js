checkFactsTables();

function checkFactsTables() {
    var mappingFound = false;
	var indicatorFactsTables = new PAUtils().getTableAncestors(current.indicator.cube.facts_table).toString();
	var expectedFactTables = ',' + indicatorFactsTables + ',';
	var gr = new GlideRecord('pa_breakdown_mappings');
	gr.addQuery('breakdown', current.breakdown.sys_id);
	gr.query();
	while (gr.next()) {
		if (expectedFactTables.indexOf(',' + gr.getValue('facts_table') + ',') >= 0) {
			mappingFound = true;
		}
    }
	if (!mappingFound) {
		gs.addErrorMessage(gs.getMessage("Breakdown must have a mapping to a facts table that matches Indicator facts table ({0})", [indicatorFactsTables]));
		current.setAbortAction(true);
	}
}
