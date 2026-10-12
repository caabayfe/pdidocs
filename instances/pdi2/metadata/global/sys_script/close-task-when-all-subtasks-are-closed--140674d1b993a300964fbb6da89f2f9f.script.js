// Close task when all subtasks are closed

// state = 1 = Open
// state = 2 = Work In Progress
// state = -5 = Pending

// If there are no open, pending or work in progress subtasks, then close the task
if (getSubtaskCount('-5,1,2') === 0) {
    // state = 3 = Closed Complete
    var taskState = 3;
    var taskGr = new GlideRecord('alm_transfer_order_line_task');
    if (taskGr.get(current.task)) {
		// If there are any closed skipped subtasks, then this state goes to the task
        var closedSkippedTaskCount = getSubtaskCount('7');
        if (closedSkippedTaskCount) {
			taskState = 7;
        }
        taskGr.state = taskState;
        taskGr.update();
    }
}

function getSubtaskCount(stateValue) {
    var subtaskCount = 0;
    var subtaskGr = new GlideAggregate('alm_transfer_order_line_subtask');
    subtaskGr.addQuery('task', current.task);
    subtaskGr.addQuery('state', 'IN', stateValue);
    subtaskGr.addAggregate('COUNT');
    subtaskGr.query();
    if (subtaskGr.next()) {
        subtaskCount = parseInt(subtaskGr.getAggregate('COUNT'));
    }
    return subtaskCount;
}
