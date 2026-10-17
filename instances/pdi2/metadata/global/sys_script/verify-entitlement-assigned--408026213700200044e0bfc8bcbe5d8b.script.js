verifyEntitlements();

function verifyEntitlements() {
	var gr = new GlideRecordSecure('sys_user');
	gr.addEncodedQuery(current.licensed_by.assigned_condition);
	gr.addQuery('sys_id', current.assigned_to);
	gr.query();
	var queryRows = gr.getRowCount();
	if (queryRows != 1) {
		gs.addErrorMessage(gs.getMessage('Your selected entitlement does not match your entitlement condition'));
		current.setAbortAction(true);
	}
}
