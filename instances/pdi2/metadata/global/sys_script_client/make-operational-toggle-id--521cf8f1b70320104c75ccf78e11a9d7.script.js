function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Create unique ID from Scope and Toggle name.

	var name = g_form.getValue('name');
	if (!name) 
		return;

	var scope = g_scratchpad.scope;
	if (!scope)
		scope = 'global';
		
	var ga = new GlideAjax('global.SystemRunLevel');
	ga.addParam('sysparm_name', 'make_id_value');
	ga.addParam('sysparm_scope', scope);
	ga.addParam('sysparm_desc', name);
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
