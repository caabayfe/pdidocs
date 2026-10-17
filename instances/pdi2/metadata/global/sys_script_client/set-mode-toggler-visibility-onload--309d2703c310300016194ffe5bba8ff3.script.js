function onLoad() {
   // Set the operation to execute for processors and client_callable_script_include&#13;
   var val = g_form.getValue("type");
   if (val == 'processor' || val == 'client_callable_script_include' || val == 'REST_Endpoint' || val == 'ui_page' || val == 'GraphQL' || val == 'AMB') {
	  //Also, hide the mode-toggler if present
	  var modeToggler = $$("[data-type=mode_toggler]")[0];
	   if (modeToggler != null) {
		   modeToggler.hide();
	   }
   }
}
