(function executeRule(current, previous /*null when async*/ ) {
    //This BR checks for duplicate featured content records for a topic while inserting/updating

    var m2mGr = current.connected_content.getRefRecord();
    var refField = m2mGr.content_type.content_reference_field;
    var contentId = m2mGr.getValue(refField);
    var query = 'connected_content.' + refField + '=' + contentId;
    var gr = new GlideRecord('featured_content');
    gr.addQuery('topic', current.topic);
    gr.addQuery(query);
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Duplicate featured content for the same topic are not allowed"));
    }

})(current, previous);
