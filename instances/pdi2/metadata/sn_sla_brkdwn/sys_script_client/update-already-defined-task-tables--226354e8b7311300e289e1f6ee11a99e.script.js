function onLoad() {
	var taskTableEle = g_form.getElement("task_table");
	var taskTableCtrl = g_form.getControl("task_table");
	if (!taskTableCtrl || g_form.isReadOnly(taskTableEle, taskTableCtrl))
		return;

	if (!g_scratchpad || !g_scratchpad.breakdownTableData)
		return;

	var currentBreakdownTable = g_form.getValue("sla_breakdown_table");
	if (!currentBreakdownTable)
		return;

	var currentTaskTable = g_form.getValue("task_table");
	var breakdownTableData = g_scratchpad.breakdownTableData;

	breakdownTableData.forEach(function(tableData) {
		var breakdownTableName = tableData.tableName;
		if (breakdownTableName !== currentBreakdownTable)
			return;

		var taskTypesDefined = tableData.taskTypesDefined;
		if (!taskTypesDefined)
			return;

		var taskTypeOption;
		for (var taskTableName in taskTypesDefined) {
			if (taskTableName === currentTaskTable && !g_form.isNewRecord())
				continue;

			taskTypeOption = g_form.getOption("task_table", taskTableName);
			if (!taskTypeOption)
				continue;

			if (taskTableName === currentTaskTable)
				g_form.setValue("task_table", "");
			taskTypeOption.disabled = true;
			taskTypeOption.innerHTML = new GwtMessage().getMessage("{0} (active definition already exists)", taskTypeOption.innerHTML);
		}
	}, this);
}
