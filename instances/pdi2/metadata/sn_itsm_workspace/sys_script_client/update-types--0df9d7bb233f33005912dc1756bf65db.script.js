function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	var ga = new GlideAjax('ITSMChoiceValuesAJAX') ;
	ga.addParam('sysparm_name','getTableChoicesAJAX');
	ga.addParam('sysparm_table', g_form.getValue('target_table'));
	ga.addParam('sysparm_field', g_form.getValue('target_field'));
	ga.getXMLAnswer(function(answer) {
		var choices = JSON.parse(answer);
		if (choices) {
			g_form.clearOptions('value');
			for (var i = 0; i < choices.length; i++) {
				var choice = choices[i];
				if (choice.label)
					g_form.addOption('value', choice.value, choice.label);
			}
		}
	}); 
}
