(function executeRule(current, previous /*null when async*/ ) {

    var acrUtils = new EvtMgmtAlertCorrelationRulesUtils();

    // Check only if the feature's property is "true",
    // IMPORTANT:To check if the feature is active, use 'isVirtualAlertFeatureActive'.
    // The 'isVirtualAlertFeaturePropertyEnabled' key in 'g_scratchpad' will contain a boolean (true / false), not a string
    g_scratchpad.isVirtualAlertFeaturePropertyEnabled = acrUtils.isVirtualAlertFeaturePropertyEnabled();

    // Check only if the feature is active - property is enabled and required columns exist.
    // The 'isVirtualAlertFeatureActive' key in 'g_scratchpad' will contain a boolean (true / false), not a string
    g_scratchpad.isVirtualAlertFeatureActive = acrUtils.isVirtualAlertFeatureActive();
})(current, previous);
