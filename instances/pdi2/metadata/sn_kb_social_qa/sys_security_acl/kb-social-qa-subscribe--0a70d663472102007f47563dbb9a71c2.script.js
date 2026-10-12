if(gs.nil(current.question) || current.operation() == 'insert')
	answer = true;
else
	answer = new SocialQACommon().canRead(current.question.kb_knowledge_base);
