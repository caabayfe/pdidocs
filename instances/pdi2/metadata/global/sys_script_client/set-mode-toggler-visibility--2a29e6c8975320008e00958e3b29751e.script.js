function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   var modeToggler = $$("[data-type=mode_toggler]")[0];
   if (newValue == 'processor' || newValue == 'client_callable_script_include' || newValue == 'REST_Endpoint' || newValue == 'client_callable_flow_object' || newValue == 'GraphQL' || newValue == 'AMB') { 
	  if (modeToggler != null)
	      modeToggler.hide();
   } else {
	     if (newValue == 'ui_page') //for ui_page too, do not show the toggler
			 modeToggler.hide();
	     else
			 modeToggler.show();
   }
}
