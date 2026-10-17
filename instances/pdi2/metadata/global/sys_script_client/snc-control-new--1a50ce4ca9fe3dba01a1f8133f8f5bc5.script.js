function onChange(control, oldValue, newValue) {
   if (newValue == 'true') {
       g_form.setDisplay('new_roles', false);
   } else {
       g_form.setDisplay('new_roles', true);
   }
}
