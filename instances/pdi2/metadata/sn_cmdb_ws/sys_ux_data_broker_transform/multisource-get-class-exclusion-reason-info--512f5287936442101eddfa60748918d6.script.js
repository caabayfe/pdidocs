function transform(input) {
	var util = new sn_cmdb_ws.MultisourceUtil();
	var deniedClassList = util.getMultisourceDenyList();
	var excludedReasonInfo = util.getClassExclusionReasonInfo(input.table, deniedClassList);
	return excludedReasonInfo;
}
