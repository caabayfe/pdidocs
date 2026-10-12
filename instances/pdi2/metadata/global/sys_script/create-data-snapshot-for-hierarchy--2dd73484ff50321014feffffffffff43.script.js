(function executeRule(current, previous /*null when async*/) {

	var rhSysId = current.record_hierarchy;
	var rhGR = new GlideRecord('sys_record_hierarchy');
	rhGR.addQuery('sys_id', rhSysId);
	rhGR.query();
	if (rhGR.next()) {
		createDataSnapshot(rhGR);
	}

})(current, previous);

function createDataSnapshot(rhGR) {

	if (checkDataSnapshotForHierarchyExists(rhGR.table)) {
		updateExistingDataSnapshot(rhGR);
	} else {
		createDataSnapshotForHierarchy(rhGR);
	}
}

function checkDataSnapshotForHierarchyExists(table) {
	var gr = new GlideRecord('pa_dm_analytics_source');
	gr.addQuery('table', table);
	gr.addQuery('is_hierarchy', true);
	gr.query();
	return gr.next();
}
function updateExistingDataSnapshot(rhGR) {
	var gr = new GlideRecord('pa_dm_analytics_source');
	gr.addQuery('table', rhGR.table);
	gr.addQuery('is_hierarchy', true);
	gr.query();
	if (gr.next()) {
		// newDimensions = existingDimensions + newDimension
		var newDimensions = gr.dimensions + ',' + rhGR.reference_field;
		gr.dimensions = newDimensions;
		gr.update();
	}
}

function createDataSnapshotForHierarchy(rhGR) {
	var gr = new GlideRecord('pa_dm_analytics_source');
		gr.initialize();
		gr.name = rhGR.table + "_hierarchy";
		gr.table = rhGR.table;
		gr.dimensions = rhGR.reference_field;
		gr.frequency = "all_activity";
		gr.is_data_collection_enabled = true;
		gr.is_hierarchy = true;
		gr.insert();
}
