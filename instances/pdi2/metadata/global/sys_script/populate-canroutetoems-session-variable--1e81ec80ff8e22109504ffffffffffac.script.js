(function executeRule(current, previous /*null when async*/ ) {
    if (!g_scratchpad.canRouteToEMS) {
        g_scratchpad.canRouteToEMS = SNC.UsageAnalyticsScriptUtils.canRouteToEMS().toString();
    }
})(current, previous);
