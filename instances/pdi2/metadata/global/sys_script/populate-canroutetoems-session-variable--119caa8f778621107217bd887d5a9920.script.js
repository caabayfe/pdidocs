(function executeRule(current, previous /*null when async*/ ) {
    if (!g_scratchpad.canRouteToEMS) {
        var canRouteToEMS = SNC.UsageAnalyticsScriptUtils.canRouteToEMS().toString();
        g_scratchpad.canRouteToEMS = canRouteToEMS;
        //Set session variable as well because it is used in sysrule_view records
        var session = gs.getSession();
        session.putClientData('canRouteToEMS', canRouteToEMS);
    }
})(current, previous);
