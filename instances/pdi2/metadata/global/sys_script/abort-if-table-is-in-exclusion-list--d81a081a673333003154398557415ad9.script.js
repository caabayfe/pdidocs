(function executeRule(current, previous /*null when async*/) {

	var scanUtil = new sn_instance_scan.ScanUtil();
	var tableName = current.table;
	if (!scanUtil.isTableInExclusionList(tableName))
		return;

	current.setAbortAction(true);
	gs.setRedirect(GlideTransaction.get().getRequest().getHeader("referer"));
	gs.addErrorMessage(gs.getMessage("Attempt to define a check for {0} was aborted because the table is either in exclusion list or too large to scan.", tableName));

})(current, previous);
