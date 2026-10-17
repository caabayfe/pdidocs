function onChange(control, oldValue, newValue) {
   if (newValue == 'time_off') {
      g_form.setValue('include', 'exclude');
   }
}
