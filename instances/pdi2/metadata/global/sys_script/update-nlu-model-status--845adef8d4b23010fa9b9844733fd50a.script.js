(function executeRule(current, previous /*null when async*/ ) {

    var stateTypes = global.NLUConstants.MODEL_STATE_TYPES;
    global.NLUModel.updateSecondaryModelStatus(current.document, current.target_language, stateTypes.error_while_translating);

})(current, previous);
