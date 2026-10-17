if (new KBKnowledge().canRetire(current)) {
    //check if queried table is different from actual record's table.
    if (current.getTableName() != current.sys_class_name) {
        //update current to point to the table extended from kb_knowledge with specified sys_id.
        current = new GlideRecordUtil().getGR("kb_knowledge", current.getUniqueValue());
    }
    new global.KnowledgeUIAction().retireKnowledgeRecord(current);
    if (typeof RP !== 'undefined') {
        if (RP.getParameterValue("sysparm_referring_url").indexOf('kb_view.do') >= 0) {
            gs.setRedirect("kb_view.do?sys_kb_id=" + current.sys_id);
        }
    }
}
