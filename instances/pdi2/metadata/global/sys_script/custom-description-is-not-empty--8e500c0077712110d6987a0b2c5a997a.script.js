(function executeRule(current, previous /*null when async*/ ) {

    var acrUtils = new EvtMgmtAlertCorrelationRulesUtils();
    if (acrUtils.isVirtualAlertFeatureActive()) {
        var acrConstants = new EvtMgmtAlertCorrelationRulesConstants();
        var customDesciptionValue = current.getValue(acrConstants.CUSTOM_GROUP_DESCRIPTION).trim();
        if (current.getValue(acrConstants.OVERRIDE_GROUP_DESCRIPTION) == "1") {
            if (!customDesciptionValue) {
                gs.addErrorMessage(gs.getMessage("Custom description must have a value"));
                current.setAbortAction(true);
            }
            if (customDesciptionValue == acrConstants.GROUP_OF_ALERTS) {
                gs.addErrorMessage(gs.getMessage("'Custom description' must be different from its default value"));
                current.setAbortAction(true);
            }
        } else {
            current.setValue(acrConstants.CUSTOM_GROUP_DESCRIPTION, acrConstants.GROUP_OF_ALERTS);
        }
    }


})(current, previous);
