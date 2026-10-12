function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	var scope = g_scratchpad.scope;
	g_form.setValue("name", scope + "." + newValue);
}
