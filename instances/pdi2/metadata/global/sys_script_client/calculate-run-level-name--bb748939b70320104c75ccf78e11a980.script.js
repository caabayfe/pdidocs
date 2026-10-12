function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

    //Make the run level id from the short 
	var short_description = g_form.getValue('short_description');
	if (!short_description) 
		return;

	var scope = g_scratchpad.scope;
	if (!scope)
		scope = 'global';
	
	var ga = new GlideAjax('global.SystemRunLevel');
	ga.addParam('sysparm_name', 'make_id_value');
	ga.addParam('sysparm_scope', scope);
	ga.addParam('sysparm_desc', short_description);
	ga.getXML(getResponse);
	
}

function getResponse(response) {
	var answer = response.responseXML.documentElement.getAttribute('answer');
	if (answer) {
		g_form.setValue("id", answer);
		g_form.setDisabled("id",false);
		g_form.setReadOnly("id",true);  
	} 
}
