function transform(input) {
	var result = {
		count: 0,
		label: gs.getMessage('Orphan de-duplication tasks')
	};

	var ga = new GlideAggregate('sn_cmdb_ws_reconcile_duplicate_template_suggested_task');
	ga.addEncodedQuery('state=2^templateISEMPTY');

	// check if we want to show only open tasks
	if ((new GetDedupeTaskInfo()).showOnlyOpenTasks()) {
		ga.addEncodedQuery('task.state=1');
	}

	ga.addAggregate('COUNT');
	ga.query();
	if (ga.next())
		result.count = parseInt(ga.getAggregate('COUNT'));

	return result;
}
