(function executeRule(current, previous /*null when async*/ ) {

    if (current.resource_type.toString() !== "record" || gs.nil(current.target_field.toString())) {
        return;
    }
    var gr = new GlideRecord(current.target_table.toString());
    var fieldGE = gr.getElement(current.target_field.toString());
    if (fieldGE == null) {
        gs.addErrorMessage(gs.getMessage("Selected field doesn't belong to the table selected"));
        current.setAbortAction(true);
    }

})(current, previous);
