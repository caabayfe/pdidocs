function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (oldValue !== newValue) {
      g_form.clearValue('life_cycle_stage_status');
   }
   
}
