function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var selectElements = g_form.getValue('select_elements');
	if(selectElements =='true' || newValue =='true'){
		//show all_elements
		g_form.setVisible('all_elements', true);
		
		//hide the conditions
		g_form.setVisible('conditions', false);
	}else{
		//hide all_elements
		g_form.setVisible('all_elements', false);
		
		//show the conditions
		g_form.setVisible('conditions', true);
	}
		
}
