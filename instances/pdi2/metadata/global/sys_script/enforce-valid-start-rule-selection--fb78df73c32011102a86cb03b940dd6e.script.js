(function executeRule(current, previous /*null when async*/ ) {

    var schema_version = current.process_schema_version || current.process_definition.schema_version;
    var selectedStartRuleId = current.getValue('start_rule');
    var startRuleLabel = current.start_rule.label;
    var afterActivitiesStartRuleId = PADConstants.activityStartRules.AFTER_ACTIVITIES.sysId;
    var afterPreviousStartRuleId = PADConstants.activityStartRules.AFTER_PREVIOUS.sysId;
    var withPreviousStartRuleId = PADConstants.activityStartRules.WITH_PREVIOUS.sysId;

    if (schema_version < 2) {
        if (selectedStartRuleId === afterActivitiesStartRuleId) {
            gs.addErrorMessage(gs.getMessage("To use the {0} Start Rule, upgrade your process by opening it in Process Automation Designer.", startRuleLabel));
            current.setAbortAction(true);
        }
    } else {
        if (selectedStartRuleId === afterPreviousStartRuleId || selectedStartRuleId === withPreviousStartRuleId) {
            gs.addErrorMessage(gs.getMessage("The {0} Start Rule has been deprecated. Select a different Start Rule in Process Automation Designer.", startRuleLabel));
            current.setAbortAction(true);
        }
    }
})(current, previous);
