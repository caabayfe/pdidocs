var commonUtil = new SocialQACommon();
var user = gs.getUserID();
answer = false;

var grRef = new GlideRecord(current.reference_name);
if(grRef.isValid() && grRef.get(current.reference_id)) {
	var kbManager = false;
	if(grRef.getTableName() == 'kb_social_qa_question')
		kbManager = commonUtil.isKnowledgeManager(grRef.kb_knowledge_base, user);
	else
		kbManager = commonUtil.isKnowledgeManager(grRef.question.kb_knowledge_base, user);
	if(kbManager)
		answer = true;
}
