function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue == 'false' && oldValue == 'true')
	   g_form.showFieldMsg(control, g_scratchpad.wish_list_warning_msg, "warning");
   
}
