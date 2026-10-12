function onBefore(current, previous) {
	current.disable_commenting = current.kb_knowledge_base.disable_commenting;
	current.disable_suggesting = current.kb_knowledge_base.disable_suggesting;
}
