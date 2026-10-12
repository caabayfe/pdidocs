function onAfter(current, previous) {
    //This function will be automatically called when this rule is processed.
    var processor = gs.action.getGlideURI().get('sysparm_type');
    var publish = gs.action.getGlideURI().get('publish');
    if (processor == 'knowledge_read_processor' && publish == 'true')
        if (current.kb_knowledge_base.kb_version == "3") {
            //Save to user preference and reuse in UI
            gs.getUser().setPreference("knowledge.publish_import_documents", publish);
            new KnowledgeUIActionSNC().publish(current);
        }
}
