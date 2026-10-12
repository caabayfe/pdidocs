function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (!g_form.isNewRecord() || (isLoading || newValue === '')) {
      return;
   }
   if(newValue === 'true' ){
      g_form.setValue('children_layout', '0');
   } else {
      g_form.setValue('children_layout', '1');
   }
}
