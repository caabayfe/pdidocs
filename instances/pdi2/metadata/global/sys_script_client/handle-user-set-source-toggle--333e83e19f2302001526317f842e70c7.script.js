function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   //Type appropriate comment here, and begin script below
	if (newValue === 'sys_user_group') {
		g_form.setDisplay('groups', true);
		g_form.setDisplay('conditions', false);
	} else if (newValue === 'sys_user') {
		g_form.setDisplay('conditions', true);
		g_form.setDisplay('groups', false);
	}
}
