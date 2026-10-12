function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	if(!new KBCommon().isAccessBlockedWithNoUC()){
		var gr = new GlideRecord("kb_uc_can_contribute_mtom");
		gr.addQuery("kb_knowledge_base", current.kb_knowledge_base);
		gr.query();
		if(!gr.next()){
			gs.addInfoMessage(gs.getMessage('The Can Contribute criteria is empty. All users with role will have read access to the articles in this Knowledge Base'));
		}
	}
}
