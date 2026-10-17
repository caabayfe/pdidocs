
/** All tasks for the in-flight TOLs are created at once and these tasks should be closed in the order mentioned.

	When a task with higher order than some other tasks is closed,
	This business rule will close skip the tasks whose order is less than the current closing task.

	This business rule will only run when there are more than 2 open/pending/work in progress tasks for the TOL.
	This ensures that the business rule will run only for in-flight TOLs as for any new TOL that is created,
	will have a workflow associated with it and thus creating one task at a time.

* */

function getOpenTaskCount() {
	var taskCount = 0;
	var taskGr = new GlideAggregate('alm_transfer_order_line_task');
	taskGr.addQuery('transfer_order_line', current.transfer_order_line);
	// state = 1 = Open, state = 2 = Work In Progress, state = -5 = Pending
	taskGr.addQuery('state', 'IN', '-5,1,2');
	taskGr.addAggregate('COUNT', 'order');
	taskGr.orderByAggregate('COUNT', 'order');
	taskGr.setGroup(false);
	taskGr.query();
	if (taskGr.next()) {
		taskCount = parseInt(taskGr.getAggregate('COUNT', 'order'), 10);
	}
	return taskCount;
}

function getFirstOpenTask() {
	var tolTaskGr = new GlideRecord('alm_transfer_order_line_task');
	tolTaskGr.addQuery('transfer_order_line', current.transfer_order_line);
	// state = 1 = Open, state = 2 = Work In Progress, state = -5 = Pending
	tolTaskGr.addQuery('state', 'IN', '-5,1,2');
	tolTaskGr.orderBy('order');
	tolTaskGr.setLimit(1);
	tolTaskGr.query();
	if (tolTaskGr.next()) {
		return tolTaskGr;
	}
	return null;
}

function closeBeforeTasks() {
	var tolTaskGr = new GlideRecord('alm_transfer_order_line_task');
	tolTaskGr.addQuery('transfer_order_line', current.transfer_order_line);
	// state = 1 = Open, state = 2 = Work In Progress, state = -5 = Pending
	tolTaskGr.addQuery('state', 'IN', '-5,1,2');
	tolTaskGr.addQuery('order', '<', parseInt(current.order, 10));
	tolTaskGr.orderBy('order');
	tolTaskGr.query();
	while (tolTaskGr.next()) {
		tolTaskGr.setValue('state', 7);
		tolTaskGr.update();
	}
}

function closeSkipPreviousTasks() {
	var taskCount = getOpenTaskCount();
	var firstOpenTaskGr = getFirstOpenTask();

	if (!gs.nil(firstOpenTaskGr)) {
		if (taskCount >= 2 && firstOpenTaskGr.getValue('order') < current.getValue('order')) {
			// Close skip the tasks whose order is less than the current
			closeBeforeTasks();
		}
	}
}

closeSkipPreviousTasks();
