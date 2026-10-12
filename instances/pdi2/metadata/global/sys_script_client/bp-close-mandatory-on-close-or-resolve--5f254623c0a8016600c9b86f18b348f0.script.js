function onSubmit() {
   var action = g_form.getActionName();
   if (action != 'close_incident' && action != 'resolve_incident')
      return;

   // Close notes and Close code must be on the form
   if (!g_form.hasField('close_notes') || !g_form.hasField('close_code'))
      return;

   var state = '6';
   if (action == 'close_incident') {
     state = '7';
     if (typeof global_var_choice_display_values !== 'undefined') {
       if (global_var_choice_display_values.incident_state)
         g_form.addOption('incident_state', state, global_var_choice_display_values.incident_state);
       if (global_var_choice_display_values.state)
         g_form.addOption('state', state, global_var_choice_display_values.state);
     }
   }

   g_form.setValue('incident_state', state);
   g_form.setValue('state', state);
   g_form.setDisplay('close_notes', true);
   g_form.setMandatory('close_notes', true);
   g_form.setDisplay('close_code', true);
   g_form.setMandatory('close_code', true);
   if (g_form.getValue('close_notes') == '' || g_form.getValue('close_code') == '')
      return false;
}
