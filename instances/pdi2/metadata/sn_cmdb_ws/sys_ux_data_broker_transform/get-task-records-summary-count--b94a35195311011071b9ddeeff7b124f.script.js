function transform(input) {
	var wrapperFn = function() {
		var DM = new CMDBWsDMConstants();
		var taskUiProxy = new CMDBWsDMTaskUIProxy();
		var taskSysId = input.sysId;
		var policyTypeInfo = taskUiProxy.getPolicyTypeForTask(taskSysId);
		if (policyTypeInfo.sys_id == DM.OOB_POLICY_TYPES.ATTESTATION.sys_id) {
			var attestationUtil = new sn_cmdb_ws.CMDBAttestationUtil();
			return attestationUtil.getCisSummaryCount(taskSysId);
		} else {
			return taskUiProxy.getTaskRecordSummary(taskSysId);
		}
	};

	return new CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get Task records summary count", wrapperFn);
}
