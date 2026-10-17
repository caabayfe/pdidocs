(function executeRule(current, previous /*null when async*/ ) {
    var knowledgeGr = new GlideRecord('kb_knowledge');
    var kbTaskGr = knowledgeGr.addJoinQuery('m2m_kb_task');
    knowledgeGr.addQuery('sys_class_name', 'kb_template_known_error_article');
    kbTaskGr.addCondition('task', current.sys_id);
    knowledgeGr.setLimit(1);
    knowledgeGr.query();
    if (!knowledgeGr.hasNext()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Please attach a Known error article, before resolving the record as known error"));
    }
})(current, previous);
