function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   g_form.clearValue('flow_designer_flow');
   g_form.clearValue('workflow');
}
