function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.clearValue('breakdown');
   g_form.clearValue('breakdown_level2');
   g_form.clearValue('element');
   g_form.clearValue('element_level2');
   g_form.clearValue('aggregate');
   g_form.clearValue('follow_element');
   g_form.clearValue('followed_breakdown');
}
