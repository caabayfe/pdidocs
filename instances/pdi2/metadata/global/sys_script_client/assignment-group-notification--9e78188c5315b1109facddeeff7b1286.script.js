function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

	var value = g_form.getValue('assignment_group');
	if(value.length==0)
		g_form.hideFieldMsg('assignment_group');
	else
		g_form.showFieldMsg('assignment_group', getMessage("Rules with the Assignment Group field populated are executed after rules without the assignment group"),'info');
}
