function onChange(control, oldValue, newValue) {
   if (newValue == "var") {
      g_form.setDisplay('field', false);
      g_form.setDisplay('var_name', true);
      g_form.setMandatory('var_name', true);
   } else if (newValue == "field") {
      g_form.setDisplay('field', true);
      g_form.setDisplay('var_name', false);
      g_form.setMandatory('field', true);
   }
}
