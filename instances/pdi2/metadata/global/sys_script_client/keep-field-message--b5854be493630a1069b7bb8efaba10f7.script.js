function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	   	var message = getMessage('Enable user criteria check to determine visibility of current topic and its child topics in navigation and popular topics widget. The criteria set also applies to child topics. Criteria in connected content still govern content visibility on topic pages.');
   		g_form.showFieldMsg('enable_user_criteria_check', message);

	}
