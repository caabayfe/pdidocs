var templateTask = current.template_task;

// As each subtasks are associated with the task, check if there are any subtasks for the current task
var subtaskTOLGr = new GlideRecord('alm_transfer_order_line_subtask');
subtaskTOLGr.addQuery('task', current.getUniqueValue());
subtaskTOLGr.query();
if(!subtaskTOLGr.hasNext()){ 
	var subtaskGr = new GlideRecord('alm_template_subtask');
	subtaskGr.addQuery('task', templateTask);
	subtaskGr.query();
	while(subtaskGr.next()){
		subtaskTOLGr.initialize();
		subtaskTOLGr.setValue('subtask_name', subtaskGr.subtask_name);
		subtaskTOLGr.setValue('task', current.sys_id);
		// state = 1 = Open
		subtaskTOLGr.setValue('state', 1);
		subtaskTOLGr.setValue('short_description', subtaskGr.short_description);
		subtaskTOLGr.insert();
	}
}
