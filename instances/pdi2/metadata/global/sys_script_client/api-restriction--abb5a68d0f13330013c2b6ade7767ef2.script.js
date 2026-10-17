function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || newValue === oldValue) {
      return;
   }
   var invalid = !(/^[a-z][a-zA-Z_0-9]+$/.test(newValue)) || newValue.length < 2 || newValue.length > 20;
   if (invalid) {
	   g_form.showFieldMsg("api", getMessage("{0} name should be between 2-20 characters in length, alphanumeric, and not begin with a number.", g_form.getLabelOf("api")), "error");
		g_form.setValue('public_api', '');
	} else {
		if (!newValue)
			g_form.setValue('public_api', '');
		else {
			g_form.getReference('sys_scope', function(app) {
				g_form.setValue('public_api', 'g_modal.' + (app.scope || "") + '.' + newValue+'()');
			});
		}
	}
}
