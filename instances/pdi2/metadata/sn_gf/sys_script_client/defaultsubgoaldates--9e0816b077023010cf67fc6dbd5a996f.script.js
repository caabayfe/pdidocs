function onLoad() {
  
	if(this && g_form.isNewRecord() && !g_form.getValue('parent_goal') && g_form.getViewName() == "workspace_goals_apw")
		return;
	
    if (g_form.isNewRecord()) {
        var parentGoal = g_form.getValue('parent_goal');
        var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
        goalFrameworkAjax.addParam('sysparm_name', 'getGoalDates');
        goalFrameworkAjax.addParam('sysparm_parent_goal', parentGoal);

        goalFrameworkAjax.getXML(function(response) {
            var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
            if (answer) {
				if(answer['start_date'])
					g_form.setValue('start_date', answer['start_date']);
				if(answer['end_date'])
					g_form.setValue('end_date', answer['end_date']);
            }
        });
    }
}
