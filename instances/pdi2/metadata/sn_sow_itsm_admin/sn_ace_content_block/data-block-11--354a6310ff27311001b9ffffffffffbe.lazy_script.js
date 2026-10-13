(function(context, pageParams, blockcontext){
    var selectedPlanName = "";
	var taskDefGR = new GlideRecord("comm_task_definition");
	taskDefGR.addQuery("sys_id", blockcontext.selectedRecords[0]);
    taskDefGR.query();
	if(taskDefGR.next()) {
        selectedTaskName = taskDefGR.getValue("name");
	}
    return {
        selectedTaskName: selectedTaskName,
        taskCopyName: selectedTaskName + " copy"
    };
})(context, pageParams, blockcontext);
