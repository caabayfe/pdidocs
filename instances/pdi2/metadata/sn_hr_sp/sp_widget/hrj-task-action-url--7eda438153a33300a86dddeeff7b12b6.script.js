(function() {
	data.task = {};
	data.user_id = gs.getUserID();
	data.user_name = gs.getUserName();
	data.title = $sp.getValue("title");
	data.short_description = $sp.getValue("short_description");
	if (input)
		data.sys_id = input.sys_id;
	else if (options)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getValue("sys_id");
	
	if (GlidePluginManager.isActive("com.glide.platform_ml"))
		data.recommendedWidget = $sp.getWidget("recommended_articles_for_todos",{task_id:data.sys_id,table:"sn_hr_core_task"});
	var hrtt = new hr_TaskTicket();
	if (input && input.action === 'setTaskSkipped') 
		hrtt.setTaskSkipped(input.request);
	if (input && input.action === 'setTaskFinished')
		hrtt.setTaskFinished(input.request);
	data.task = hrtt.getTasks(data.sys_id);
	if(Object.keys(data.task).length==0)
		return;
	if (!data.task.assigned_to_me) {
		if (data.task.finished)
			data.completed_by = data.task.assigned_to.name;
		else {
			if (gs.nil(data.task.assigned_to.userId))
				data.caption = gs.getMessage("Task is unassigned");
			else
				data.caption = gs.getMessage("Task assigned to {0}", data.task.assigned_to.name.toString());
			data.link_text = gs.getMessage("Assigned to link");
		}
	}
})();
