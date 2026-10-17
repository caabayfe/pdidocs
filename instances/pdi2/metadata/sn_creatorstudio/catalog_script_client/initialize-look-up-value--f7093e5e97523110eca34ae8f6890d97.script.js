function onLoad() {
   //Type appropriate comment here, and begin script below
	var tableName = g_form.getValue('lookup_table');
	if (!tableName)
		return;

	var ga = new GlideAjax('global.QuestionCreationWizardUtils');
	ga.addParam('sysparm_name', 'getTableFields');
	ga.addParam('sysparm_tablename', tableName);
	ga.getXML(handleResponse);
}

function handleResponse(serverResponse) {
	var answer = JSON.parse(serverResponse.responseXML.documentElement.getAttribute("answer"));
	var currentVal = g_form.getValue('lookup_value');
	var currentValExist = false;
	g_form.clearOptions('lookup_value');
	
	for (var index = 0; index < answer.length; index++) {
		g_form.addOption('lookup_value', answer[index].value, answer[index].display_value);
		if (currentVal && currentVal == answer[index].value) {
			currentValExist = true;
			g_form.setValue('lookup_value', currentVal, answer[index].display_value);
		}
	}
	if (!currentValExist)
		g_form.setValue('lookup_value', answer[0].value, answer[0].display_value);
}
