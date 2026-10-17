var evtMgmtHealthMonitorCommon = new EvtMgmtHealthMonitorCommon();
if (!evtMgmtHealthMonitorCommon.selfHealthOnlyAlertsActive())
    new EvtMgmtHealthMapBuilder().createService();
new EvtMgmtHealthHandleMonitors().handleMonitors("insert");
