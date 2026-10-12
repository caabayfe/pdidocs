(function executeRule(current, previous /*null when async*/ ) {
    var msg;
    var query = "label=" + current.label.toString() + "^ORvalue=" + current.value.toString();
    var gr = new GlideRecord("help_answer");
    gr.addQuery("question", current.question);
    gr.addEncodedQuery(query);
    gr.query();
    if (gr.getRowCount() > 0) {
        msg = gs.getMessage("Answer with same value or label already exists for this question");
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
    }
})(current, previous);
