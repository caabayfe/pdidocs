function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if(newValue == 'delete')
		g_form.setValue('use_current_record_as_condition', true);
   //Type appropriate comment here, and begin script below
   
}
