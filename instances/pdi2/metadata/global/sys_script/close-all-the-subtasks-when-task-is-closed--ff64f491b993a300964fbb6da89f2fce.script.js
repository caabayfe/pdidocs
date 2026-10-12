// Close subtasks
var subtaskGr = new GlideRecord('alm_transfer_order_line_subtask');
subtaskGr.addQuery('task', current.getUniqueValue());
// State = -5 = Pending, State = 1 = Open, State = 2 = Work In Progress
subtaskGr.addQuery('state', 'IN', '-5,1,2');
if (current.getValue('state') === '3') {
    // State = 3 = Closed Complete
    subtaskGr.setValue('state', 3);
}
if (current.getValue('state') === '7') {
    // State = 7 = Closed Skipped
    subtaskGr.setValue('state', 7);
}
subtaskGr.setWorkflow(false);
subtaskGr.updateMultiple();
