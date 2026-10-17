(function executeRule(current, previous /*null when async*/ ) {

    var fieldVal = current.getValue("secondary_info_fields").split(",");
    if (fieldVal.length > 3) {
        gs.addErrorMessage(gs.getMessage("Field list configuration for Employee Profile Header cannot exceed 3 fields"));
        current.setAbortAction(true);
    }

})(current, previous);
