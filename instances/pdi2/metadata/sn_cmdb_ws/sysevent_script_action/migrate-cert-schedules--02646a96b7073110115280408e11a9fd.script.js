var progressId = event.parm1;
	
    var policyMgr = new sn_cmdb_ws.CMDBWsDMPolicyManager();
    policyMgr.migrateLegacyDataCertSchedules(progressId);

    var progressUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();
    progressUtil.deleteProgress(progressId);
