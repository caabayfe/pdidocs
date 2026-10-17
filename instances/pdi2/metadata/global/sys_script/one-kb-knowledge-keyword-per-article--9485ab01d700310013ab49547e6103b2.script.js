function onBefore(current, previous) { 
	var kbKnowledgeKeyword = new GlideRecord("kb_knowledge_keyword");
	if (kbKnowledgeKeyword.get("knowledge", current.knowledge)){
		current.setAbortAction(true);   
		gs.addInfoMessage(gs.getMessage("Record with specified article already exists!"));
		return;	
	}
}
