function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
	g_form.hideFieldMsg(control, true);

	if (newValue.length < 8)
		g_form.showErrorBox(control, getMessage('Key must be at least 8 characters in length'));
}
