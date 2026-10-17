(function executeRule(current, previous /*null when async*/) {
    gs.eventQueue('text_index.build_synonym_mapping',current,current.sys_id, null,"text_index");
})(current, previous);
