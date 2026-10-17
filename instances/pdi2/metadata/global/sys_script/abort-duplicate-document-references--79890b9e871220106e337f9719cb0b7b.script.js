(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("ds_document_references");
    gr.addQuery("document", current.document);
    gr.addQuery("table_name", current.table_name);
    gr.addQuery("target_record", current.target_record);
    gr.addQuery("sys_id", "!=", current.sys_id); // Exclude self
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('This document reference already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
