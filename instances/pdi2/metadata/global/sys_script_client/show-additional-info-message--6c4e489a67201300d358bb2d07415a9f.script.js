function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		  return;
	}
	
	g_form.clearMessages();
	if(newValue == "-3"){
		g_form.addInfoMessage(getMessage("Please add customer visible comments"));
	}
}
