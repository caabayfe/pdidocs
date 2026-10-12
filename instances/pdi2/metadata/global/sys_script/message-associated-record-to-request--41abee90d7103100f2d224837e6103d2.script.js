function onBefore(current, previous) {
	var isWorkspace = current.getEngineParameter('engagement_channel') === 'workspace';
	var req_task = (current.parent) ? current.parent : current.parent_interaction;
	var taskLink = "/" + req_task.sys_class_name + ".do?sys_id=" + req_task;
	var taskNumParam = (isWorkspace) ? req_task.number : "<a href ='" + taskLink + "'>" + req_task.number +"</a>";
	var notificationMsg = gs.getMessage( "Request associated to:  {0}", taskNumParam);
	gs.addInfoMessage(notificationMsg);
}
