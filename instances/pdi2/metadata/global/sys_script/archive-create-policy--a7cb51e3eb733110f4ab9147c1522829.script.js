(function executeRule(current, previous /*null when async*/) {
	var dmPolicyUtil = new DMPolicyUtil();
	dmPolicyUtil.findOrCreatePolicyForTable(current.table);
})(current, previous);
