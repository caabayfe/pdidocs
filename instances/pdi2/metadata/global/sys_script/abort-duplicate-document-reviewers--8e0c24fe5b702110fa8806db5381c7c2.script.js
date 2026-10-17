(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("ds_document_reviewer");
    gr.addQuery("document", current.document);
    gr.addQuery("reviewer", current.reviewer);
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('This document reviewer already exists.'));
        current.setAbortAction(true);
    }

})(current, previous);
