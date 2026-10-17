(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue("internal_permission") == "no_access" && current.getValue("external_permission") != "no_access") {
        gs.addErrorMessage(gs.getMessage("Invalid combination: Internal Permission is 'No Access', but External Permission is '{0}'. Please set External Permission to 'No Access'.", current.getDisplayValue("external_permission")));
        current.setAbortAction(true); // Prevent saving the record
    }

})(current, previous);
