(function executeRule(current, previous /*null when async*/) {

    var validInputOutputFields = current.fields.split(',').indexOf(current.getValue('output_field')) < 0;
    if (!validInputOutputFields) {
        inputErrorMessage = gs.getMessage("Output Field {0} cannot be part of Input Fields", current.output_field);
        gs.addErrorMessage(inputErrorMessage);
        current.setAbortAction(true);
    }
})(current, previous);
