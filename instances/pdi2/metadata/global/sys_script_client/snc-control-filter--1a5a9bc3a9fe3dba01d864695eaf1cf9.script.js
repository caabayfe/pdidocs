function onChange(control, oldValue, newValue) {
   if (newValue == 'true') {
       g_form.setDisplay('filter_roles', false);
   } else {
       g_form.setDisplay('filter_roles', true);
   }
}
