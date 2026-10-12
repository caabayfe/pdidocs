(function executeRule(current, previous /*null when async*/ ) {
    try {
        var parentConditionType = current.type;
        var leftConditionType = current.left.type;
        var rightConditionType = current.right.type;
        if (parentConditionType == "PROPERTY" && (leftConditionType == "CONTEXT" || rightConditionType == "CONTEXT")) {
            throw gs.getMessage("'Field/Value' condition cannot have 1st or 2nd condition from 'Contextual field/value' condition type.");
        } else if (parentConditionType == "CONTEXT" && (leftConditionType != "CONTEXT" || rightConditionType != "CONTEXT")) {
            throw gs.getMessage("'Contextual field/value' condition must have 1st and 2nd condition from 'Contextual Field/Value' condition type.");
        }
    } catch (error) {
        current.setAbortAction(true);
        gs.setRedirect(current);
        gs.addErrorMessage(error);
    }

})(current, previous);
