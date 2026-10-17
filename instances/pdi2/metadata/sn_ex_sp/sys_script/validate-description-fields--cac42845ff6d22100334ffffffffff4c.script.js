(function executeRule(current, previous /*null when async*/ ) {
    var descriptionFieldValues = current.getValue("description_fields").split(",");
    var titleFieldValue = current.getValue("title_field");

    if (descriptionFieldValues.indexOf(titleFieldValue) > -1) {
        gs.addErrorMessage(gs.getMessage("The field chosen for the title cannot be used in the description."));
        current.setAbortAction(true);
    }
    if (descriptionFieldValues.length > 2) {
        gs.addErrorMessage(gs.getMessage("Maximum of two description fields are allowed to be selected."));
        current.setAbortAction(true);
    }

})(current, previous);
