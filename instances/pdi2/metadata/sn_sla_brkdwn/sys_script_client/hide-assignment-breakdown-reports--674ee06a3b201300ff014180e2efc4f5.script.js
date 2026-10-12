function onLoad() {
	var tabNameForBreakdownFields = {
		"assigned_to^assignment_group": "sla_durationbyassignment",
		"assigned_to": "sla_durationbyassignedto",
		"assignment_group": "sla_durationbyassignmentgroup"
	};

	for (var field in tabNameForBreakdownFields)
		if (field !== g_scratchpad.breakdownFields)
			hideTabByName(tabNameForBreakdownFields[field]);

	if (g_scratchpad.breakdownFields && g_scratchpad.breakdownFields !== "")
			addHidden(g_form.getFormElement(), "task_sla.sys_id", g_form.getUniqueValue());

	function hideTabByName(tabName) {
		if (!tabName)
			return;

		if (g_tabs2Sections.findTabIndexByName(tabName) !== -1)
			g_tabs2Sections.hideTabByName(tabName);
	}
}
