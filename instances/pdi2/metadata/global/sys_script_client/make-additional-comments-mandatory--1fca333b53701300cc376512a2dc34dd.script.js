function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		  return;
	}
	
	if (newValue == '-3') {
		g_form.setMandatory("comments",true);
   }else{
	   g_form.setMandatory("comments",false);
   }
}
