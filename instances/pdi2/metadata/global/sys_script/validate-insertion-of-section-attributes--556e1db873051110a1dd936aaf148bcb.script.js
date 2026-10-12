(function executeRule(current, previous /*null when async*/ ) {

    var validator = new ParameterSectionAndPageValidator(current);
    if (!validator.isValidSectionAttribute()) 
        current.setAbortAction(true);

})(current, previous);
