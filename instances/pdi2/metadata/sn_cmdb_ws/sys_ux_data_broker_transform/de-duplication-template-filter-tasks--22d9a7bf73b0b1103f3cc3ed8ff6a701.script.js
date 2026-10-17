function transform(input) {
	var result = {};
	var taskIds = input.taskIds;

	var limit = gs.getProperty('sn_cmdb_ws.dedupetemplate.max_task_query_limit');

	// if limit is not set or it is set to an invalid value, go with the default value of 50
	if (!limit || limit <= 0 ) {
			limit = 50;
	}

	// we don't want to allow the user to put in an enormous IN query, so we will truncate the list
	var slicedTasksIds = taskIds.slice(0, limit);

	var gr = new GlideRecord('reconcile_duplicate_task');
	gr.addQuery('sys_id', 'IN', slicedTasksIds);
	gr.orderByDesc('sys_updated_on');
	gr.query();

	var items = [];

	while (gr.next()) {
			var item = (new GetDedupeTaskInfo()).getTaskInfo(gr);
			if (item) {
					items.push(item);
			}
	}

	result = {'items': items};
	return result;
}
