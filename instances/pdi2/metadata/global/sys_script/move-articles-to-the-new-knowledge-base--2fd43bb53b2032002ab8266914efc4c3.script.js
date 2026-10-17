(function executeRule(current, previous /*null when async*/) {

	// Preventing loop
    if (current === previous) return;

	// Move articles to the new Knowledge Base.
	var gr = new GlideRecord("kb_knowledge");
	gr.addQuery("kb_category", current.sys_id );
	gr.addQuery("kb_knowledge_base", previous.parent_id);
	gr.query();
	gr.setValue('kb_knowledge_base',  current.parent_id);
	gr.updateMultiple();

})(current, previous);
