function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.setValue("target_record", "");
   g_form.setValue("target_field", "");
   
}
