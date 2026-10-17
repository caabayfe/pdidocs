(function() {
	data.task = {};
	data.esc_task_status_options = {};
	
	if (input)
		data.sys_id = input.sys_id;
	else if (options)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getValue("sys_id");
	
	if (GlidePluginManager.isActive("com.glide.platform_ml"))	
		data.recommendedWidget = $sp.getWidget("recommended_articles_for_todos",{task_id:data.sys_id,table:"sn_hr_core_task"});
	var hrtt = new sn_hr_sp.hr_TaskTicket();
	data.task = hrtt.getTasks(data.sys_id);
	if(Object.keys(data.task).length==0)
		return;
	//`ESC task status` options
	if (data.task.finished)
		data.esc_task_status_options = hrtt.getTaskCompletionOptions(data.task);
	
	if (!data.task.assigned_to_me) {
		if (data.task.finished)
			data.completed_by = data.task.assigned_to.name;
		else {
			if (gs.nil(data.task.assigned_to.name))
				data.caption = gs.getMessage("Task is unassigned");
			else
				data.caption = gs.getMessage("Task assigned to {0}",data.task.assigned_to.name);
		}
	} else {
		var widgetOptions = {};
		widgetOptions.sys_id = data.sys_id;
		if(data.task.success_message)
			widgetOptions.success_message = data.task.success_message;
		if(data.task.eSignConfiguration.document_type == "document_template")
			data.widget = $sp.getWidget("hr-e-sign-sign-document", widgetOptions);
		else
			data.widget = $sp.getWidget("e-sign-task", widgetOptions);
	}
	
	if (input && input.action === 'setTaskSkipped') 
		hrtt.setTaskSkipped(input.request);
	
	var hrTaskUtil = new sn_hr_sp.HRTaskUtil();
	data.task.fulfillment_type = hrTaskUtil.getTaskFulfillmentTypeJourneyOrLE(data.task.sys_id);
})();
