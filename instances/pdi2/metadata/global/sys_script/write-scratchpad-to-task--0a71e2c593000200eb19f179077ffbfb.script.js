function onAfter(current, previous) {
   if (current.state == "executing" || current.table != "em_remediation_task")
	   return;
	var scratchpad = current.scratchpad;
	var taskId = current.id;
		
	var grTask = new GlideRecord("task");
	if (!grTask.get(taskId))
		return;

	
	var attach = new Attachment();
	if (!attach.isIndexed())
		attach.write("em_remediation_task", grTask.sys_id, "scratchpad", "txt", scratchpad);
	
	if (!grTask.closed_at) {
		grTask.closed_at = new GlideDateTime();
		grTask.update();
	}
}
