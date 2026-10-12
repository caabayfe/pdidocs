if(gs.nil(current.question) || current.operation() == 'insert')
	answer = true
else
	answer = new SocialQACommon().isKnowledgeManager(current.question.kb_knowledge_base, gs.getUserID());
