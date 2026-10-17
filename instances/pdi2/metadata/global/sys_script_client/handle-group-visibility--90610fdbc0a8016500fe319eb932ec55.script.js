function onChange(control, oldValue, newValue) {
   if (newValue == 'on_call') {
      showHideElement('group', true, false);
      if (oldValue != newValue) {
         g_form.setValue('show_as', 'on_call');
      }
   } else {
      showHideElement('group', false, false);
   }
}
