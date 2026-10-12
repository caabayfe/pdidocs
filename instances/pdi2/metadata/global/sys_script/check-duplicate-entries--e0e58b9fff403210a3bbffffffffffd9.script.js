(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('pa_cdc_hierarchy');
	gr.addQuery('record_hierarchy.table', current.record_hierarchy.table);
	gr.addQuery('record_hierarchy.reference_field', current.record_hierarchy.reference_field);
	gr.query();
	if (gr.next()) {
		// similar configuration already exists
		gs.addErrorMessage(gs.getMessage("Data Snapshots Hierarchy configuration for this table and reference field already exists"));
		current.setAbortAction(true);
	}

})(current, previous);
