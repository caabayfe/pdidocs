answer = false;
if(current.profile.document == gs.getUserID()) {
	answer = true;
}
else {
	answer = new SocialQACommon().isKnowledgeManager(current.question.kb_knowledge_base, gs.getUserID());
}
