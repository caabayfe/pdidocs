function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var goal = g_form.getValue('goal');
    var goalFrameworkAjax = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
    goalFrameworkAjax.addParam('sysparm_name', 'getGoalDates');
    goalFrameworkAjax.addParam('sysparm_parent_goal', goal);

    goalFrameworkAjax.getXML(function(response) {
        var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        if (answer) {
            if (answer['start_date'])
                g_form.setValue('start_date', answer['start_date']);
            if (answer['end_date'])
                g_form.setValue('end_date', answer['end_date']);
        }
    });
}
