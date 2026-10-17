function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(oldValue == newValue && !isLoading) // action is "on change" but there is no real change
	   return;
	
	if(g_form.getValue('execute_on') != 'Specific MID Server')
		return;
	
	// Check that the MID server contain "EventManagement" application
	if(missingApplication(g_form.getValue('mid_server'))) {
		g_form.addErrorMessage("The MID Server does not contain a MID Server member.");
	}
}

// Check that a mid server contain EvenManagement application
function missingApplication(midServerSysId) {
	var ga = new GlideAjax("EmMidUtil");
	ga.addParam('sysparm_name', 'missingApplication');
	ga.addParam('midSysId', midServerSysId);
	ga.getXMLWait();
	var missing = ga.getAnswer();
	if(missing == "true")
		return true;
	return false;
}
