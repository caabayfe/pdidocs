(function () {
	// Early return if action is aborted or if it is an RBA in the status
	if (current.isActionAborted() || (current.agent_correlator + '').indexOf('rba.') == 0)
		return;

	// DEF0715020: Abort if not a discovery record
	// Exit if it is a common ECC to skip, or it has no sensor - Both won't be Discovery
	// 'true' is for ignoreQueueAndState flag
	if (AutomationEccSensorConditions.shouldSkipEccQueue(current, true) ||
		!SncSensorProcessor.quickSensorCheck(current))
		return;

    if (DiscoveryStatusMonitor.shouldUseOptimizedCountingForStatus(current.agent_correlator + '')) {
        DiscoveryStatusMonitor.trackProbe(current);
        return;
    }

    if (shouldUpdateCounters())
        DiscoveryStatus.updateStatusStartedCount(current.agent_correlator);

    function shouldUpdateCounters() {
        return typeof _DO_NOT_UPDATE_STATUS_STARTED_COUNT == 'undefined' || _DO_NOT_UPDATE_STATUS_STARTED_COUNT == false;
    }
})();
