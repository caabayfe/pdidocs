var todoUtils = Class.create();

todoUtils.getMyApprovals = function() {
	var u = gs.getUserID();
	var answer = new Array();
	var i = 0;
	answer[i++] = new String(u);
	var g = new GlideRecord("sys_user_delegate");
	g.addQuery("delegate", u);
	g.addQuery("approvals", "true");
	g.addQuery("starts", "<=", gs.daysAgo(0));
	g.addQuery("ends", ">=", gs.daysAgo(0));
	g.query();
	while (g.next())
		answer[i++] = new String(g.user);

	return answer;
};

/* Get the delegated approvals for the logged in user
 * @return Array - An array of delegated record sys_id's
 */
todoUtils.getDelegatedApprovals = function() {
	var delegatedRecords = [];

	if (!GlidePluginManager().isActive('com.glide.granular_service_delegation'))
		return delegatedRecords;

	var grApprovals = new sn_delegation.DelegationUtil().getDelegatedApprovalsForUser(gs.getUserID());
	while (grApprovals.next())
		delegatedRecords.push(grApprovals.getUniqueValue());

	return delegatedRecords;
},

todoUtils.getMyApprovalsBasedOnPermissions = function (getNowMobileApprovals) {
	var filteredSysIds = [];
	var hrApprovalTables = GlidePluginManager().isActive("com.sn_hr_core") ? sn_hr_core.hr.TABLE_CASE_EXTENSIONS : [];
	var approverGr = new GlideRecord("sysapproval_approver");
	var approverSysIds = this.getMyApprovals();
	if(gs.getProperty('sn_me_todos.all_approvals_mobile_enabled') === 'false'){
		approverGr.addNotNullQuery("sysapproval");
	}
	approverGr.addQuery("state", "requested");
	var qc = approverGr.addQuery("approver", "IN", approverSysIds);
	qc.addOrCondition("sys_id", "IN", this.getDelegatedApprovals());
	approverGr.query();
	while (approverGr.next()) {
		if ((approverGr.sysapproval.sys_class_name == "sc_request") || (approverGr.sysapproval.sys_class_name == "sc_req_item")) {
			if (gs.hasRole("approver_user") || gs.hasRole("business_stakeholder"))
				filteredSysIds.push(approverGr.getValue("sys_id"));
		} else if (!getNowMobileApprovals || approverGr.sysapproval.sys_class_name == "sn_wsd_core_workplace_request" || hrApprovalTables.indexOf(approverGr.sysapproval.sys_class_name.toString()) !== -1) 
			filteredSysIds.push(approverGr.getValue("sys_id"));	
          else if(gs.getProperty('sn_me_todos.all_approvals_mobile_enabled') !== 'false'){
				filteredSysIds.push(approverGr.getValue("sys_id"));
		}
	}
	
	return filteredSysIds;
};
