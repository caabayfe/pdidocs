(function executeRule(current, previous /*null when async*/ ) {
    if (!previous)
        return;

    var changeModel = new ChangeModel(current.chg_model.getRefRecord());
    var stateFieldName = changeModel.getStateFieldName();
    var initialStateGr = changeModel.getInitialState();

    // If it's a new record in the initial state, or the model has changed and it's in the initial state don't do anything.
    if ((current.isNewRecord() || current.chg_model.changes()) && current.getValue(stateFieldName) === initialStateGr.getValue("state_value"))
        return;

    var previousState = previous.getValue(stateFieldName);
    var previousDisplayValue = previous.getDisplayValue(stateFieldName);

    if ((!previousState && current.isNewRecord()) ||
        (current.chg_model.changes() && current.getValue(stateFieldName) !== initialStateGr.getValue("state_value"))) {
        previousState = initialStateGr;
        previousDisplayValue = initialStateGr.getDisplayValue("state_label");
    }

    // Check if we can transition between the states.
    if (!changeModel.canTransition(previousState, current)) {

        // Collect failed transition names
        var failedConditions = [];
        if (changeModel.transitionResult && Array.isArray(changeModel.transitionResult.conditions)) {
            changeModel.transitionResult.conditions.forEach(function(condition) {
                if (!condition.passed)
                    failedConditions.push(condition.condition.name);
            });
        }

        var errorMsg = gs.getMessage("Change model '{0}' prevented state transition from {1} to {2}",
            [
                current.getDisplayValue("chg_model"),
                previousDisplayValue,
                current.getDisplayValue(stateFieldName)
            ]);

        if (failedConditions.length > 0) {
            errorMsg = gs.getMessage("Change model '{0}' prevented state transition from {1} to {2} because these transition conditions failed: {3}",
                [
                    current.getDisplayValue("chg_model"),
                    previousDisplayValue,
                    current.getDisplayValue(stateFieldName),
                    failedConditions.join(", ")
                ]);
        }

        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }

})(current, previous);
