(function executeRule(current, previous /*null when async*/) {
	
	var noPendingDiscoveryRuns = true;
	var cloudResourceScheduleSysID = current.sys_id + '';
	var ipScheduleSysID = current.vm_run + '';
	var cloudResourceDiscoveryUtil = new CloudResourceDiscoveryUtil();

	if (cloudResourceDiscoveryUtil.checkDiscoveryRunsOfSchedule(cloudResourceScheduleSysID)) {
		noPendingDiscoveryRuns = false;
		gs.addErrorMessage(gs.getMessage("Cannot delete an active discovery schedule while it's discovery status in progress"));
		current.setAbortAction(true);
	}

	if (JSUtil.notNil(ipScheduleSysID) && cloudResourceDiscoveryUtil.checkDiscoveryRunsOfSchedule(ipScheduleSysID)) {
		noPendingDiscoveryRuns = false;
		gs.addErrorMessage(gs.getMessage("Cannot delete an active discovery schedule while it's dependent IP schedule's discovery status in progress"));
		current.setAbortAction(true);
	}

	if (JSUtil.notNil(ipScheduleSysID) && noPendingDiscoveryRuns)
		cloudResourceDiscoveryUtil.wipeRespectiveIPSchedule(ipScheduleSysID);
	
})(current, previous);
