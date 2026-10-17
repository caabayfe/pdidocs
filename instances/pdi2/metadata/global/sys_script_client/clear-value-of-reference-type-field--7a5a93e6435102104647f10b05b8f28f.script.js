function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if(newValue == false || newValue == 'false') {
		g_form.clearValue('reference_type');
   }
   if(newValue == true || newValue == 'true') {
		g_form.clearValue('reference_field');
   }
}
