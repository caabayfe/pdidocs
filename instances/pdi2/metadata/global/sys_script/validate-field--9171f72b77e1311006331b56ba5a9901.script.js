(function executeRule(current, previous /*null when async*/ ) {

    var isValidField = new ProminAllowedColumns().getAllowedColumnList("promin_automated_finding", current.table, current.field, '');
    if (!isValidField) {
        var internalType = new ProminUtils().getInternalTypeOfSelectedField(current.table, current.field);
        if (internalType == 'string') {
            gs.addErrorMessage(gs.getMessage("Textual or string fields are not allowed. Please select another field for the finding definition."));
        } else if (internalType == 'integer') {
            gs.addErrorMessage(gs.getMessage("Numbers or Integer fields are not allowed. Please select another field for the finding definition."));
        } else {
            gs.addErrorMessage(gs.getMessage("Fields of type {0} are not allowed. Please select another field for the finding definition", [internalType]));
        }
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }

})(current, previous);
