function onBefore(current, previous) {
   //This function will be automatically called when this rule is processed.
   var tags = new global.GlobalKnowledgeUtil().getClientParameters('kb_social_qa_question.tags');
	if(tags && tags != '')
		current.last_activity = new GlideDateTime();
}
