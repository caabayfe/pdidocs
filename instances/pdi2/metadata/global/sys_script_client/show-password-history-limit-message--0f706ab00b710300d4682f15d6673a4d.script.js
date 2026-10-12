function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   
   // comparing with sys id to make this work only for credential stores of type Local ServiceNow Instance"
   if (g_form.getValue('type') == 'e611433fbf020100710071a7bf073921' && g_form.getBooleanValue('enforce_history_policy') == true) {
	 g_form.addInfoMessage(g_scratchpad.enforcePasswordMessage);     
   }
   
}
