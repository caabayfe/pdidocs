function onAfter(current, previous) {
	// Don't update question record if answer itself is inactive
	if (!current.active)
		return ;
	// Keep answer_count field on the related question record in sync with the number answer records
	var question = new GlideRecord('kb_social_qa_question');
	if(question.get(current.question)) {
		question.answer_count += 1;
		question.last_activity = new GlideDateTime();
		question.update();
	}
}
