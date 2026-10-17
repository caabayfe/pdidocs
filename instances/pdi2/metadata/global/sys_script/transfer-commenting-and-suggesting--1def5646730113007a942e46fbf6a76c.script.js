(function executeRule(current, previous) {
    if(current.kb_knowledge_base != previous.kb_knowledge_base) {
        current.disable_commenting = current.kb_knowledge_base.disable_commenting;
        current.disable_suggesting = current.kb_knowledge_base.disable_suggesting;
    }
})(current, previous);
