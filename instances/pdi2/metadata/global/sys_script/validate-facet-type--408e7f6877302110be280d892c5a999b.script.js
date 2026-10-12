(function executeRule(current, previous /*null when async*/ ) {
    var field = current.ais_facet_name;
    var type = current.type;
    var vf = new ValidateFacets();
    var answer = vf.validate_facet_type_with_param(field, type);
    if (answer == 'error_date_type') {
        gs.addErrorMessage(
            gs.getMessage("Invalid type, date field only supports Single Select")
        );
        current.setAbortAction(true);
    }
})(current, previous);
