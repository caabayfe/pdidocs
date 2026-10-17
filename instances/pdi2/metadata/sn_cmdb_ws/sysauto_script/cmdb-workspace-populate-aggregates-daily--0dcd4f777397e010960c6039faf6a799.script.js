/* 
/*
/*
 * Calls util which calculates number of CIs for encoded queries and the group as a whole.
 */
var cmdbWorkspaceUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
cmdbWorkspaceUtil.populateNoOfMatchingCIsForEncQrys();
cmdbWorkspaceUtil.populateManagementAggregates();

var landingPageUtil = new sn_cmdb_ws.CMDBWsLandingPageUtil();
landingPageUtil.populateImportantActionDailyData();
landingPageUtil.populateTotalCI();

var cmdbWsProductAdoptionUtil = new sn_cmdb_ws.CMDBWsProductAdoptionUtil(); 
cmdbWsProductAdoptionUtil.populateAdoptionAggregates();

var cmdbWsInsightsUtil = new sn_cmdb_ws.CMDBWsInsightUtil();
cmdbWsInsightsUtil.resetAppServiceClassificationJob();

var cmdbWsPerfInsightsUtil = new sn_cmdb_ws.CMDBWsPerfInsightsUtil(); 
cmdbWsPerfInsightsUtil.populatePerfInsightsAggregates();

CMDBWsDMUtil.calculateAgingTasks();

// Invoke CMDB Workspace Aggregates collection PA job
cmdbWorkspaceUtil.invokeWsAggregatesDailyPAJob();

var cmdbWsWorkload = new sn_cmdb_ws.CMDBWsDMWorkload();
cmdbWsWorkload.refreshWorkloadAggTable();

var cmdbWsCertDashboardManager = new sn_cmdb_ws.CMDBWsDMCertDashboardManager();
cmdbWsCertDashboardManager.activateCertInstanceAggregateDataCalculationJob();
cmdbWsCertDashboardManager.calculateAgingTaskByUserAndGroup();
