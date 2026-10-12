(function executeRule(current, previous /*null when async*/) {
	var kbKnowledge = new GlideRecord("kb_knowledge");
	kbKnowledge.addQuery("kb_knowledge_base", current.sys_id);
	kbKnowledge.addQuery('disable_commenting','!=',current.disable_commenting);
	kbKnowledge.setWorkflow(false);
	kbKnowledge.query();
	
	while (kbKnowledge.next()){
		kbKnowledge.setValue("disable_commenting", current.disable_commenting);
		kbKnowledge.setWorkflow(false);
		kbKnowledge.autoSysFields(false);
		kbKnowledge.update();
	}
})(current, previous);
