function onLoad() {
   //Type appropriate comment here, and begin script below
	var questionText = g_form.getValue('question_text');
	if (!questionText)
		return;
	g_form.setValue('question_set', questionText);
}
