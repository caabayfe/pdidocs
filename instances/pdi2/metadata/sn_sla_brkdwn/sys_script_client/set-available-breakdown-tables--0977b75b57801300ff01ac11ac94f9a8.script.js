function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var slaBreakdownTableEle = g_form.getElement("sla_breakdown_table");
	var slaBreakdownTableCtrl = g_form.getControl("sla_breakdown_table");
	if (!slaBreakdownTableCtrl || g_form.isReadOnly(slaBreakdownTableEle, slaBreakdownTableCtrl))
		return;

	if (!g_scratchpad || !g_scratchpad.breakdownTableData) {
		g_form.clearOptions("sla_breakdown_table");
		return;
	}

	if (!newValue) {
		g_form.clearOptions("sla_breakdown_table");
		return;
	}

	var breakdownTableData = g_scratchpad.breakdownTableData;

	var currentBreakdownTable = g_form.getValue("sla_breakdown_table");
	g_form.clearOptions("sla_breakdown_table");

	breakdownTableData.forEach(function(tableData) {
		var taskTypesDefined = tableData.taskTypesDefined;
		if (!taskTypesDefined)
			return;

		g_form.addOption("sla_breakdown_table", tableData.tableName, tableData.tableLabel);

		if (taskTypesDefined[newValue] && newValue !== oldValue) {
			var breakdownTableOption = g_form.getOption("sla_breakdown_table", tableData.tableName);
			breakdownTableOption.disabled = true;
			breakdownTableOption.innerHTML += " (" + getMessage("Already in use") + ")";

			if (currentBreakdownTable === tableData.tableName)
				g_form.setValue("sla_breakdown_table", "");
		}
	});
}
