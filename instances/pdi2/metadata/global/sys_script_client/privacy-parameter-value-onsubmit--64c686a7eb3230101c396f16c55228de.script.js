function onSubmit() {
	var ga = new GlideAjax('global.PrivacyCoreValidator');
	ga.addParam('sysparm_name', 'validateParameterValues');
	ga.addParam('sysparm_techniqueParams', g_form.getUniqueValue());
	ga.addParam('sysparm_value', g_form.getValue('value'));
	ga.getXMLWait();   
	var answer = ga.getAnswer();
	if(answer !== null && answer !== '') {
		g_form.addErrorMessage(answer);
		return false;
	} else
		g_form.clearMessages();
}
