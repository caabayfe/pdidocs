function knowledgeView() {
	var kb = new GlideRecordSecure("kb_knowledge");
	if(kb.get(event.instance)) kb.incrementViewCount();
}

knowledgeView();
