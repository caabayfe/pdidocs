if(current.kb_knowledge_base)
	answer = new KnowledgeAccess().managerRights(current.kb_knowledge_base);
else
	answer = true;
