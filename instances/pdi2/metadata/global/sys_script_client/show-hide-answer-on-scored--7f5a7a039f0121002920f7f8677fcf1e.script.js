function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	showHideFields(g_form, g_form.getValue('datatype'), g_form.getValue('method'));
}

//when to display scored, correct_answer fields in asmt_metric form
function showHideFields (g_form, datatype, method) {
	var isDesiredDataType = (datatype == 'choice' || datatype == 'boolean' || datatype == 'checkbox' || datatype =='template' || datatype == 'scale' || datatype == 'numericscale' || datatype == 'imagescale' || datatype=='long' || datatype=='percentage' || datatype == 'custom');

	if (isDesiredDataType || method == 'script')
		g_form.setDisplay('scored', true);
	else {
		g_form.setDisplay('scored', false);
		showHideCorrectAnswer(g_form, 'removeAll');
	}

	if (g_form.getValue('scored') == "true") {
		if (isDesiredDataType)
			showHideCorrectAnswer(g_form, datatype);
		else if (method == 'script') 
			showHideCorrectAnswer(g_form, 'number');

		if (datatype == 'checkbox')
			g_form.setValue('correct_answer', g_form.getValue('correct_answer_checkbox'));
		if (datatype == 'boolean')
			g_form.setValue('correct_answer', g_form.getValue('correct_answer_yesno'));

	}
	else
		showHideCorrectAnswer(g_form, 'removeAll');
}

function showHideCorrectAnswer(g_form, type) {
	g_form.setMandatory("correct_answer_choice", type=='choice'||type=='scale'||type=='numericscale'||type=='imagescale');
	g_form.setDisplay("correct_answer_choice", type=='choice'||type=='scale'||type=='numericscale'||type=='imagescale');
	g_form.setMandatory("correct_answer_template", type=='template');
	g_form.setDisplay("correct_answer_template", type=='template');
	g_form.setMandatory("correct_answer_yesno", type=='boolean');
	g_form.setDisplay("correct_answer_yesno", type=='boolean');
	g_form.setMandatory("correct_answer_checkbox", type=='checkbox');
	g_form.setDisplay("correct_answer_checkbox", type=='checkbox');
	g_form.setMandatory("correct_answer", type=='number'||type=='long'||type=='percentage'||type=='custom');
	g_form.setDisplay("correct_answer", type=='number'||type=='long'||type=='percentage'||type=='custom');
}
