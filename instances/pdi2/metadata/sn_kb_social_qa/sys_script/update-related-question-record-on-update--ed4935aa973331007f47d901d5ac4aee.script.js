function onAfter(current, previous) {
   var question = new GlideRecord('kb_social_qa_question');
	if(question.get(current.question)) {
		if(current.active) {
			question.answer_count += 1;
		}
		else {
			if(question.answer_count > 0){
				question.answer_count -= 1;
			}
		}
		question.last_activity = new GlideDateTime();
		question.update();
	}
}
