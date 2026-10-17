function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //If the user enter any amount other than zero, the percentage field should set to 0
   if (newValue != 0)
	    g_form.setValue('cost_adjustment_percentage', 0);
}
