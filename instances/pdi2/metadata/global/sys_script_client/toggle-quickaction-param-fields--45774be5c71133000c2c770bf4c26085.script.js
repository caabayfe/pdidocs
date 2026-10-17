function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   var basicMode = newValue == 'basic';
   var clientMode = newValue == 'client_event';
   g_form.setMandatory('table_name', basicMode);
   g_form.setDisplay('table_name', basicMode);
   g_form.setMandatory('display_value_field', basicMode);
   g_form.setDisplay('display_value_field', basicMode);
   g_form.setMandatory('value_field', basicMode);
   g_form.setDisplay('value_field', basicMode);
   g_form.setMandatory('query_script', !basicMode && !clientMode);
   g_form.setDisplay('query_script', !basicMode && !clientMode);
}
