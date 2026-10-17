function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }
	var ga = new GlideAjax('global.QuestionCreationWizardUtils');
	ga.addParam('sysparm_name', 'getTableFields');
	ga.addParam('sysparm_tablename', newValue);
	ga.getXML(handleResponse); 
}

function handleResponse(serverResponse) {
	var answer = JSON.parse(serverResponse.responseXML.documentElement.getAttribute("answer"));
	g_form.clearOptions('lookup_value');
	for (var index = 0; index < answer.length; index++) {
		g_form.addOption('lookup_value', answer[index].value, answer[index].display_value); 
	}
	g_form.setValue('lookup_value', answer[0].value, answer[0].display_value);
	g_form.setValue('choices', '[]');
}
