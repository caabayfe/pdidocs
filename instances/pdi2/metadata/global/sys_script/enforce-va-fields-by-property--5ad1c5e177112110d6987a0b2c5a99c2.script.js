(function executeRule(current, previous /*null when async*/ ) {
    if (!current)
        return;

    var acrUtils = new EvtMgmtAlertCorrelationRulesUtils();

    if (!acrUtils.isVirtualAlertFeatureActive()) {
        var acrConstants = new EvtMgmtAlertCorrelationRulesConstants();
        current.setValue(acrConstants.GENERATE_VIRTUAL_ALERTS, false);
    }

})(current, previous);
