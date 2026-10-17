verifyEntitlements();

function verifyEntitlements() {
	var gr = new GlideRecord('alm_entitlement');
	gr.addQuery('licensed_by', current.sys_id);
	gr.addQuery('assigned_to', '!=', current.sys_id);
	gr.query();
	var actualRows = gr.getRowCount();

	gr = new GlideRecordSecure('sys_user');
	gr.addEncodedQuery(current.assigned_condition);
	var grSQ = gr.addJoinQuery('alm_entitlement', 'sys_id', 'assigned_to');
	grSQ.addCondition('licensed_by.sys_id', current.sys_id);
	gr.query();
	var queryRows = gr.getRowCount();

	if (queryRows != actualRows) {
		gs.addErrorMessage(gs.getMessage('Selected entitlements ({0}) do not match your entitlement condition ({1})',
				[ actualRows + '', queryRows + '' ]));
		current.setAbortAction(true);
	}
}
