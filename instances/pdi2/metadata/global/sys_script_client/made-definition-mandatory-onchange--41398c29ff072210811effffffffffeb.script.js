function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
    	return;
   }

   //Type appropriate comment here, and begin script below
   if(newValue !== 'global') {
	g_form.setMandatory('definition', false);
	g_form.setDisplay('definition', false);
   } else {
	g_form.setMandatory('definition', true);
	g_form.setDisplay('definition', true);
   }
}
