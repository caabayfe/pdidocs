function onBefore(current, previous) {
	var gr = new GlideRecord('wf_activity');
	gr.addQuery('workflow_version', current.workflow_version);
	gr.addNotNullQuery('databus_lookup_id');
	gr.orderByDesc('databus_lookup_id');
	gr.setLimit(1);
	gr.query();

	// do max on the version. If there is no wf_activities yet, then
	// just default the first one to 1. 
	if (gr.next()) {
		current.databus_lookup_id = Number(gr.databus_lookup_id) + 1;
	} else {
		current.databus_lookup_id = 1;
	}
}
