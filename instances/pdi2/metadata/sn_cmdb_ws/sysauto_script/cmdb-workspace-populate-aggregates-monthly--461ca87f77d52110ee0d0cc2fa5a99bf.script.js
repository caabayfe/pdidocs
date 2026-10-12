var cmdbWsProductAdoptionUtil = new sn_cmdb_ws.CMDBWsProductAdoptionUtil(); 
cmdbWsProductAdoptionUtil.populateAdoptionAggregatesMonthly();

var cmdbWorkspaceUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
// Invoke the CMDB Workspace Aggregates Monthly Collection PA job
cmdbWorkspaceUtil.invokeWsAggregatesMonthlyPAJob();
