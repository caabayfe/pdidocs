function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
   if (oldValue != newValue) {
        g_form.clearValue('recipients');
    }
}
