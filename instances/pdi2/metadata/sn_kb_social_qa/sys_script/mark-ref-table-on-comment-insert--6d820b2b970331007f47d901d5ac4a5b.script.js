function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
   var gr = new GlideRecord(current.reference_name);
	if(gr.get(current.reference_id)) {
		gr.has_comment = true;
		if(current.reference_name == 'kb_social_qa_question') {
			gr.last_activity = new GlideDateTime();
		}
		else {
			var question = gr.question.getRefRecord();
			question.last_activity = new GlideDateTime();
			question.update()
		}
		gr.update();
	}
}
