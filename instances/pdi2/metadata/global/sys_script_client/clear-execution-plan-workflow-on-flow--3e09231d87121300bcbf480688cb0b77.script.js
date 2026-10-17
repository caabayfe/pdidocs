function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   g_form.clearValue('delivery_plan');
   g_form.clearValue('workflow');
}
