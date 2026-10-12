function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
	
	var tagsStr = new global.GlobalKnowledgeUtil().getClientParameters('kb_social_qa_question.tags');
	if(!tagsStr)
		return;
	var tags = tagsStr.split(',');
	var tagService = new SocialQATags();
	var questionId = current.getUniqueValue();
	for(var i=0; i<tags.length; i++) {
		if(tags[i] != '') {
			tagService.createTag(tags[i], questionId);
		}
	}
}
