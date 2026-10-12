answer = isInApproverGroup() || isAllowedToGrantRole();

function isInApproverGroup() {
	var groupDefault = '58851c2353322010a480ddeeff7b12b0'; //Report Access Request Approvers
	var group = gs.getProperty('glide.report.request_approver_group', groupDefault);
	var groups = gs.getUser().getMyGroups();
	if (groups.isEmpty())
		return false;

	return groups.contains(group);
}

function isAllowedToGrantRole() {
	var aclMgr = new SNC.ScopedReportViewACLManager();
	return aclMgr.isUserAllowedToGrantRole(GlideUser.getCurrentUser().getID(), current.role);
}
