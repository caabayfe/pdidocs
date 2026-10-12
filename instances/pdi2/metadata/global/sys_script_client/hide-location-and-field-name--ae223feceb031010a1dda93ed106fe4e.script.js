function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
	g_form.getReference('button', callBackFunction);
   
}

function callBackFunction(caller) {
	if(caller.type == "spannable_rating" || caller.type == "select_one_rating") {
		g_form.setDisplay('location', false);
		g_form.setDisplay('field_name', false);
	}
	else {
		g_form.setDisplay('location', true);
	}
	
}
