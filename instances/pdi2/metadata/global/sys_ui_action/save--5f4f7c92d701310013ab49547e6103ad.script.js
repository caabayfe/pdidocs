var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
kbKnowledgeBase.get(current.sys_id);
if ((current.disable_commenting != kbKnowledgeBase.disable_commenting) || (current.disable_suggest != kbKnowledgeBase.disable_suggest)){
	var kbKnowledge = new GlideRecord("kb_knowledge");
	kbKnowledge.addQuery("kb_knowledge_base", current.sys_id);
	kbKnowledge.query();
	while (kbKnowledge.next()){
		if (current.disable_commenting != kbKnowledgeBase.disable_commenting)
			kbKnowledge.setValue("disable_commenting", current.disable_commenting);
		if (current.disable_suggesting != kbKnowledgeBase.disable_suggesting)
			kbKnowledge.setValue("disable_suggesting", current.disable_suggesting);
		kbKnowledge.update();
	}
}
action.setRedirectURL(current);
current.update();
