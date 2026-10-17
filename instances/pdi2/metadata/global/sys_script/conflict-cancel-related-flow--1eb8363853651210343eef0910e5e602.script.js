(function executeRule(current, previous /*null when async*/) {
	var flowData = new ChgMgtConflictWorker(null, current.getUniqueValue()).getFlowData();
	if (flowData.flowId)
		sn_fd.FlowAPI.cancel(flowData.flowId, gs.getMessage("This flow has been canceled because the corresponding chg_mgt_worker record has been canceled."));

})(current, previous);
