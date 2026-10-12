function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
   var parm2 = gs.getProperty('glide.servlet.uri');
   var tableNames = new SocialQACommon().getTableNames();
   if(current.reference_name == tableNames.table_question) {
	   var subscribers = new SocialQAQuestion().getSubscribersToQuestion(current.reference_id);
	   gs.eventQueue('sn_kb_social_qa.question.voted', current, subscribers, parm2);
   }else if(current.reference_name == tableNames.table_answer) {
	   var subscribers = new SocialQAQuestion().getSubscribersToQuestion(current.reference_id.question);
	   gs.eventQueue('sn_kb_social_qa.answer.voted', current, subscribers, parm2);
   }
}
