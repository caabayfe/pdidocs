(function executeRule(current, previous /*null when async*/) {
	var trainingRequest = new sn_ais.RelevancyService().processCompletion(current.sys_id);
})(current, previous);
