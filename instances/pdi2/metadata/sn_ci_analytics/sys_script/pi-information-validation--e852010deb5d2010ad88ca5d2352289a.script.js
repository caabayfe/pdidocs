(function executeRule(current, previous /*null when async*/ ) {
    var table = current.event_source_table;
    var fields = current.field.split(".");
    var field = "";
    var index = 0;
    var gr = new GlideRecord(table);
    while (index < fields.length) {
        field = field + fields[index];
        var elementDescriptor = gr.getElement(field).getED();
        var elementType = elementDescriptor.getInternalType();
        if (elementType != "reference")
            break;

        var reference = elementDescriptor.getReference();
        if (reference == "sys_user") {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("User fields cannot be sent as part of 'Events' due to security reasons."));
            break;
        }
        field = field + ".";
        index++;
    }
})(current, previous);
