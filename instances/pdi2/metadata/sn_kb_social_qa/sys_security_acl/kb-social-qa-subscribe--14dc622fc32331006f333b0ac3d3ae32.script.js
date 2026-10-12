answer = false;
//REST API delete call doesn't allow dot-walking between scopes
var liveProfileId = new global.GlobalKnowledgeUtil().getSessionProfile();
if(liveProfileId == current.profile) {
	answer = true;
}
else {
	answer = new SocialQACommon().isKnowledgeManager(current.question.kb_knowledge_base, gs.getUserID());
}
