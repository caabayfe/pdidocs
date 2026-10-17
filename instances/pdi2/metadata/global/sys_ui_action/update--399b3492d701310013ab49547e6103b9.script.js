var kbKnowledgeBase = new GlideRecord("kb_knowledge_base");
kbKnowledgeBase.get(current.sys_id);
if ((current.disable_commenting != kbKnowledgeBase.disable_commenting) || (current.disable_suggesting != kbKnowledgeBase.disable_suggesting)){
	kbKnowledgeBase.disable_commenting=current.disable_commenting;
	kbKnowledgeBase.disable_suggesting=current.disable_suggesting;
}
current.update();
