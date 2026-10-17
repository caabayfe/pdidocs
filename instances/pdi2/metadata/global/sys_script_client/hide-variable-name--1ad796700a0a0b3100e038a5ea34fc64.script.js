function onChange(control, oldValue, newValue) { 
   if (newValue.indexOf('Change') == -1)
      g_form.setDisplay('expert_panel_variable', false);
   else
      g_form.setDisplay('expert_panel_variable', true);
 }
 
