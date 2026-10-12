function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   // save the form to enable tracking for UI button precondition
   g_form.save();
   
}
