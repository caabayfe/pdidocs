var pageName = GlideTransaction.get().getPageName();
addLegacyInformationMessage(pageName);
addExpiredMessageForPastValidToDate(pageName);

function addLegacyInformationMessage(pageName) {
    g_scratchpad.default_valid_to_set = new KBCommon().isDefaultValidToSet();
    var kbKnowledge = new KBKnowledgeBase();
    var kbKnowledgeBaseId = current.kb_knowledge_base;
    var showMessage = (pageName != "angular" && kbKnowledge.isKBVersion2(kbKnowledgeBaseId));
    if (showMessage)
        kbKnowledge.setUniqueLegacyInfoMessage(kbKnowledgeBaseId);
}

function addExpiredMessageForPastValidToDate(pageName){
	if(!pageName.endsWith('_update') && !current.isNewRecord() && current.workflow_state!="outdated" && new KBViewModel().isArticleExpired(current))
		gs.addInfoMessage(gs.getMessage("Article expired. Update its <i>Valid to</i> date to make it available to users."));
}
