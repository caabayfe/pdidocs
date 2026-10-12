(function executeRule(current, previous /*null when async*/) {
	
	// Return if action is aborted
	if(current.isActionAborted())
		return;

	var taskId = current.getValue('task');
	
	var metricId = current.getValue('metric');

	// For audit close all associated classes if glide.cmdb.health.autoCloseAuditTasks is set to true
	if (metricId == '24f72b5137130200f212cc028e41f155') {

		if (gs.getProperty("glide.cmdb.health.autoCloseAuditTasks", "false") == "false")
			return;
		
		var taskList = [];
		
		if (gs.nil(taskId))
			return;
		
		var additionalTask = current.getValue('additional_tasks');
		if (!gs.nil(additionalTask)) {
			taskList = additionalTask.split(',');
		}
		
		taskList.push(taskId);
		var gr = new GlideRecord('task');
		for (var i in taskList) {
			var t = taskList[i];

			if (gr.get(t)) {
				gr.setValue("state", '3');
				gr.update();
			}
		}
		return;
	}		
	
	if (GlideStringUtil.notNil(taskId)) {
		// Check if this is a de-dupe task
		var grTask = new GlideRecord("task");
		grTask.get(taskId);
		// skip if the task is already in one of the inactive states
		if (grTask.active == false)
			return;
		if (grTask.getRecordClassName() == "reconcile_duplicate_task") {
			// check if there are more than one other duplicate CI associated with the task
			var grDuplicateResult = new GlideRecord("duplicate_audit_result");
			grDuplicateResult.addQuery("follow_on_task", taskId);
			grDuplicateResult.addQuery("duplicate_ci","!=", current.getValue("ci"));
			grDuplicateResult.query();
			if(grDuplicateResult.getRowCount()<1)
				grTask.setValue("state", '3');
		} else {
			grTask.setValue("state", '3');
		}
		grTask.update();
	}
	
})(current, previous);
