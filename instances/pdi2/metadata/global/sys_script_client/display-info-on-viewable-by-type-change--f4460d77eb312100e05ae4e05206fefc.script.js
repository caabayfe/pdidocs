function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    if (oldValue == 'groups and users' && (g_form.getValue('user_list') != '' || g_form.getValue('user_list') != ''))
    	g_form.showFieldMsg('viewable_by','Updating the record will lose the current groups and users associations','info');
	
	if (newValue == 'groups and users')
		g_form.hideFieldMsg('viewable_by');
}
