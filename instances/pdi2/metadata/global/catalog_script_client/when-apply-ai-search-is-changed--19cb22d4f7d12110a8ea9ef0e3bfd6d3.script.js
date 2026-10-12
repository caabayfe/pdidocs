function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }
	g_form.setValue('ais_enabled_dummy', newValue);
}
