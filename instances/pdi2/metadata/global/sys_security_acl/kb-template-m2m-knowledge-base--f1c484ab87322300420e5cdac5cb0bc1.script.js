answer = true;

if(!current.isNewRecord())
	answer = new KnowledgeAccess().managerRights(current.kb_knowledge_base);
