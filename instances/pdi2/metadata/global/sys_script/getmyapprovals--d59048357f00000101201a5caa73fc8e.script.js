function getMyApprovals() {
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
	while( g.next())
		answer[i++] = new String(g.user);
	
	return answer;
}

function getMyAssignments() {
	var u = gs.getUserID();
	var answer = new Array();
	var i = 0;
	answer[i++] = new String(u);
	var g = new GlideRecord("sys_user_delegate");
	g.addQuery("delegate", u);
	g.addQuery("assignments", "true");
	g.addQuery("starts", "<=", gs.daysAgo(0));
	g.addQuery("ends", ">=", gs.daysAgo(0));
	g.query();
	while( g.next()) {
		answer[i++] = new String(g.user);
	}
	return answer;
}

function isApprovalMine(gr) {
	var approver = gr.approver + '';
	// if this is the sysapproval_group table, gr.approver
	// would evaluate to 'undefined'
	if (!gr.isValidField('approver'))
		approver = '';
	var approverSysId = gr.sys_id + '';
	// Check if approver is nil due to being on a list
	// of records that contain a related list of approvers
	// or due to checking a group approval
	if(JSUtil.nil(approver) && JSUtil.notNil(approverSysId)) {
		// Look at the sysapprover_approval table
		var app = new GlideRecord('sysapproval_approver');
		if (gr.getTableName() == 'sysapproval_group')
			app.addQuery('group', approverSysId);
		else
			app.addQuery('sysapproval', approverSysId);
		app.query();
		while(app.next()) {
			approver = app.approver;
			if(checkAllApprovers(approver))
				return true;
		}
	}

	return checkAllApprovers(approver);
}

function checkAllApprovers(approver){
	if(JSUtil.nil(approver))
	   return false;
	   
	var apps = getMyApprovals();
	for (key in apps) {
		if (apps[key] == approver)
			return true;
	}
	
	return false;
}
