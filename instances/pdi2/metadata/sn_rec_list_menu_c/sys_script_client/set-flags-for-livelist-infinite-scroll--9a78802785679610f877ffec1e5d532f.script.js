function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   
    if (newValue == 'automatic_refresh') {
        g_form.setValue('enable_infinite_scroll', 'true');
    }
}
