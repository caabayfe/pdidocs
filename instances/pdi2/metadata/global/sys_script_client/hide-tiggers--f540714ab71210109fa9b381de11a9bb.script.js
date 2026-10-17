function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
	if (g_form.getBooleanValue("no_triggers")) {
      g_form.setSectionDisplay("triggers", false);
   } else {
      g_form.setSectionDisplay("triggers", true);   
   }
   
}
