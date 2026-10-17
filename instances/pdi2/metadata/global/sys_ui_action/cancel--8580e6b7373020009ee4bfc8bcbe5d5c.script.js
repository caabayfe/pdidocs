// This will close remaining open tasks and it's subtask(s) if any
closeSubtasksAndTask();

function closeSubtasksAndTask() {
    // 'Close Incomplete' on 'open' subtasks/task when a TOL is cancelled
    var tolTaskGr = new GlideRecord('alm_transfer_order_line_task');
    tolTaskGr.addQuery('transfer_order_line', current.sys_id);
    // State = 1 = Open
    tolTaskGr.addQuery('state', 1);
    tolTaskGr.query();
    while (tolTaskGr.next()) {
        var subtaskGr = new GlideRecord('alm_transfer_order_line_subtask');
        subtaskGr.addQuery('task', tolTaskGr.sys_id);
        // State = 1 = Open
        subtaskGr.addQuery('state', 1);
        subtaskGr.query();
        if (subtaskGr.hasNext()) {
            // State = 4 = Closed Incomplete
            subtaskGr.setValue('state', 4);
            subtaskGr.updateMultiple();
        }
        // Close the task
        tolTaskGr.setValue('state', 4);
        tolTaskGr.update();
    }
}

// Cancel current TOL
current.stage = 'cancelled';
current.update();
