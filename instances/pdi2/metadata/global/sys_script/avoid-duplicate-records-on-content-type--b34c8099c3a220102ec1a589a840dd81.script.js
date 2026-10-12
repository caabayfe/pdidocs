(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('taxonomy_content_configuration');
    gr.addQuery("sys_id", "!=", current.getUniqueValue());
    gr.addQuery('content_table', current.getValue("content_table"));
    gr.setLimit(1);
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Record with content type {0} already exists", current.content_table));
        current.setAbortAction(true);
    }

})(current, previous);
