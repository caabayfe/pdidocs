function onBefore(current, previous) {
    var kbKnowledge = new KBKnowledgeBase();
    var kbKnowledgeBaseId = current.kb_knowledge_base;
    if (kbKnowledge.isKBVersion3(kbKnowledgeBaseId)) 
	   current.workflow_state = 'draft';   
}
