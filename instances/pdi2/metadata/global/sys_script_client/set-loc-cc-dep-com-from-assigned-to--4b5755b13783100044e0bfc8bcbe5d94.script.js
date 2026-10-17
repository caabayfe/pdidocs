function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || !g_form.getControl('location'))
		return;
   
   if (g_form.getValue('install_status') == 2 || g_form.getValue('install_status') == 6 || 
	   g_form.getValue('install_status') == 9)
	  return;
   
	g_form.getReference('assigned_to', setLocation);
}

function setLocation(assignee) {
	if (assignee && assignee.location != '')
		g_form.setValue('location', assignee.location);
	g_form.setValue('cost_center', assignee.cost_center);
	g_form.setValue('department', assignee.department);
	g_form.setValue('company', assignee.company);
}
