function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   if(newValue === '2' || newValue === '1')
	   g_form.setVisible('relationship', false);
	else
		g_form.setVisible('relationship', true);
   
}
