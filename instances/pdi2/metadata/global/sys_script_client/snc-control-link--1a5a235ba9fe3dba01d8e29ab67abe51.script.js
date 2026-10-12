function onChange(control, oldValue, newValue) {
   if (newValue == 'true') {
       g_form.setDisplay('link_roles', false);
   } else {
       g_form.setDisplay('link_roles', true);
   }
}
