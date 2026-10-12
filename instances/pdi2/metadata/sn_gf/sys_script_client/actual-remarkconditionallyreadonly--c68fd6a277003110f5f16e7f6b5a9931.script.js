function onLoad() {
	if(g_form.getViewName()=="workspace-progress"){
		g_form.setVisible("check_in_frequency", false);
	}
    if (!g_form.hasField("check_in_frequency") ||
        g_form.getValue("check_in_frequency") == "" || g_form.getValue("type") == "milestone") {
        return;
    }
    if (g_form.getValue("target_value_distribution") == "non_cumulative") {
        g_form.setReadOnly("actual_value", true);
        g_form.setReadOnly("remark", true);
    } else {
        var currentViewName = g_form.getViewName();
        var viewsToMakeActualReadOnly = [
            "actual_value_automation",
            "Workspace_Target_Sidepanel_Advanced",
			"workspace-progress"
        ];
        if (viewsToMakeActualReadOnly.indexOf(currentViewName) > -1) {
            g_form.setReadOnly("actual_value", true);
            g_form.setReadOnly("remark", true);
        }
    }
}
