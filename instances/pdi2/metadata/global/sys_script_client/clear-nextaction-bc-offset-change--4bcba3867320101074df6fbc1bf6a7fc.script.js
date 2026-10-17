function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == oldValue) {
      return;
   }

   g_form.setValue('next_action', '', '');	
}
