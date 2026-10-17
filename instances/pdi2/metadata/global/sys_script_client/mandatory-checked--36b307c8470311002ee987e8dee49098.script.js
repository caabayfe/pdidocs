function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	
   if (newValue == 'true')
      g_form.setValue("read_only", false);
}
