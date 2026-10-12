(function executeRule(current, previous /*null when async*/ ) {
    var usesRevampedStartRules = !current.getElement(PDConstants.FIELDS.START_RULE_NAME).nil();
    var results = PDUtils.processAfterSpecificStartRuleVar({
        current: current,
        table: PDConstants.TABLES.PD_LANE,
        varField: usesRevampedStartRules ? PDConstants.FIELDS.STARTS_AFTER_LANES : PDConstants.FIELDS.START_RULE_VAR_AFTER_LANES,
        parentField: PDConstants.FIELDS.PROCESS_DEFINITION
    });
    if (results.hasInvalidVar) {
        gs.addErrorMessage(
            gs.getMessage('One or more lanes are not valid'));
        current.setAbortAction(true);
        return;
    }
})(current, previous);
