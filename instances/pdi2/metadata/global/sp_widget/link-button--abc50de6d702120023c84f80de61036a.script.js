data.buttonMsg = gs.getMessage(options.button_text || "Click Here");
data.socialQAEnabled = true;
data.canReadKnowledgeBase = true;
if (options.href == "?id=sqanda_new_question") {
	data.socialQAEnabled = gs.getProperty('glide.sp.socialqa.enabled') === 'true';
	data.knowledgeBase = $sp.getPortalRecord().getValue("sqanda_knowledge_base") || gs.getProperty("glide.service_portal.sqanda.default_kb");
	data.canReadKnowledgeBase = $sp.canReadRecord("kb_knowledge_base", data.knowledgeBase);
}
