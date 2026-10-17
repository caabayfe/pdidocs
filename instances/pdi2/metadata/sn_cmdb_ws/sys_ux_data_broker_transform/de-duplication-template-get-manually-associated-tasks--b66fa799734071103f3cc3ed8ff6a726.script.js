function transform(input) {
	var result = {};
	var items = [];

	var template = input.templateSysId;

	if (template && template.length > 0) {
		var limit = gs.getProperty('sn_cmdb_ws.dedupetemplate.max_task_query_limit');

		// if limit is not set or it is set to an invalid value, go with the default value of 50
		if (!limit || limit <= 0 ) {
			limit = 50;
		}

		var gr = new GlideRecord('reconcile_duplicate_task');
		gr.addQuery('template', template);
		// for user assigned tasks, only show open tasks
		gr.addQuery('state', 1);
		gr.orderByDesc('sys_updated_on');
		gr.setLimit(limit);
		gr.query();

		while (gr.next()) {
			var item = (new GetDedupeTaskInfo()).getTaskInfo(gr);
			if (item) {
				items.push(item);
			}
		}
	}

	result = {'items': items,
		'template': template};
	return result;
}
