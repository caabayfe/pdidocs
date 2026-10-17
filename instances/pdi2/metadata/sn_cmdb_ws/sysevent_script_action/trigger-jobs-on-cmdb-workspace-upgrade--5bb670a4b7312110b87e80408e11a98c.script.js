var cmdbWorkspaceUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
// Invoke CMDB Workspace On Demand With Lookback
cmdbWorkspaceUtil.invokeWsOnDemandPAJobWithLookback();

// Invoke CMDB Workspace - Populate aggregates daily script job
cmdbWorkspaceUtil.invokeWsPopulateAggregatesDailyScriptJob();

// Invoke CMDB Workspace - Populate aggregates monthly script job
cmdbWorkspaceUtil.invokeWsPopulateAggregatesMonthlyScriptJob();
