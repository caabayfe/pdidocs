function onLoad() {
	var correctAnswer = g_form.getValue('correct_answer');
	var datatype = g_form.getValue('datatype');
	
	if (correctAnswer) {
		if (datatype == 'boolean')
			g_form.setValue("correct_answer_yesno", correctAnswer);
		else if (datatype == 'checkbox')
			g_form.setValue("correct_answer_checkbox", correctAnswer);
	}
}
