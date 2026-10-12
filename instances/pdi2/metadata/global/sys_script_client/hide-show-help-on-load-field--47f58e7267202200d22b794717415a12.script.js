function onLoad() {
   //Type appropriate comment here, and begin script below
   if (g_form.getControl('show_help')) {
	   if (g_form.getValue('show_help') == 'true') {
		   g_form.setDisplay('show_help_on_load', true);
		   return;
	   }
   }
   g_form.setDisplay('show_help_on_load', false);
}
