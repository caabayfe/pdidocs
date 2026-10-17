function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.setValue('max_capacity', newValue * g_scratchpad.partitionGroupTimeout);
     
}
