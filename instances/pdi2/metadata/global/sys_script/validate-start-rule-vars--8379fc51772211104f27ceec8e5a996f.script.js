(function executeRule(current, previous /*null when async*/ ) {
    var usesRevampedStartRules = !current.getElement(PDConstants.FIELDS.START_RULE_NAME).nil();
    var isDecisionStage = PDUtils.isDecisionStage(current);
    var activityVarField = usesRevampedStartRules ? PDConstants.FIELDS.STARTS_AFTER_ACTIVITIES : PDConstants.FIELDS.START_RULE_VAR_AFTER_ACTIVITIES;
    var laneVarField = usesRevampedStartRules ? PDConstants.FIELDS.STARTS_AFTER_LANES : PDConstants.FIELDS.START_RULE_VAR_AFTER_LANES;
    var hasStartsAfterActivities = !current.getElement(activityVarField).nil();
    var hasStartsAfterLanes = !current.getElement(laneVarField).nil();
    
    var activityResults = null;
    
    // Validate startsAfterActivities if present
    if (hasStartsAfterActivities) {
        activityResults = PDUtils.processAfterSpecificStartRuleVar({
            current: current,
            table: PDConstants.TABLES.PD_ACTIVITY,
            varField: activityVarField,
            parentField: PDConstants.FIELDS.LANE
        });
        if (activityResults.hasInvalidVar) {
            gs.addErrorMessage(
                gs.getMessage('One or more activities are not valid'));
            current.setAbortAction(true);
            return;
        }
    }
    
    // Validate startsAfterLanes if present (for decision stages)
    if (isDecisionStage && hasStartsAfterLanes) {
        var laneResults = PDUtils.processAfterSpecificStartRuleVar({
            current: current,
            table: PDConstants.TABLES.PD_LANE,
            varField: laneVarField,
            parentField: PDConstants.FIELDS.PROCESS_DEFINITION
        });
        if (laneResults.hasInvalidVar) {
            gs.addErrorMessage(
                gs.getMessage('One or more lanes are not valid'));
            current.setAbortAction(true);
            return;
        }
    }
    
    // Decision/Branch validation - only applies to activities, not lanes
    if (!activityResults || !activityResults.itemsGr) {
        return; // No activities to validate decisions on
    }
    
    var activityGr = activityResults.itemsGr;
    var activityDecisionIds = {};
    var decisionIdFromInputBranches = {};

    while (activityGr.next()) {
        if (
            activityGr.getValue(PDConstants.FIELDS.ACTIVITY_DEFINITION) ===
            PDConstants.ACTIVITY_DEFINITION_IDS.DECISION
        )
            activityDecisionIds[activityGr.getUniqueValue()] = true;
    }
    var decisionKeys = Object.keys(activityDecisionIds);
    var branches = current.getElement(usesRevampedStartRules ? PDConstants.FIELDS.STARTS_AFTER_BRANCHES : PDConstants.FIELDS.START_RULE_VAR_BRANCHES);

    if (!branches && !decisionKeys.length)
        return;

    if (branches) {
        var branchesArray = branches.getValue().split(',');
        if (!branchesArray.length)
            return;

        // branchesArray data looks like: ["decision123.branchid123", "decision234.branchid234"]
        for (var branchIndex = 0; branchIndex < branchesArray.length; branchIndex++) {
            var branch = branchesArray[branchIndex];
            var decisionId = branch.split('.')[0];
            decisionIdFromInputBranches[decisionId] = true;
            if (!activityDecisionIds[decisionId]) {
                gs.addErrorMessage(
                    gs.getMessage('Branch does not belong to a Decision Activity'));
                current.setAbortAction(true);
                return;
            }
        }
    }

    for (var keyIndex = 0; keyIndex < decisionKeys.length; keyIndex++) {
        var decisionActivityId = decisionKeys[keyIndex];
        if (!decisionIdFromInputBranches[decisionActivityId]) {
            gs.addErrorMessage(
                gs.getMessage('Decision does not have a corresponding branch.'));
            current.setAbortAction(true);
            return;
        }
    }

})(current, previous);
