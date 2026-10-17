function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if(newValue == "specific_mid_server" && "true" == g_form.getValue('use_mid'))
		g_form.setMandatory('mid_server',true);
	else
		g_form.setMandatory('mid_server',false);


   
}
