verifyEntitlements();

function verifyEntitlements() {
	var gr = new GlideRecord('cmdb_ci');
	gr.addEncodedQuery(current.licensed_by.entitlement_condition);
	gr.addQuery('sys_id', current.allocated_to);
	gr.query();
	var queryRows = gr.getRowCount();
	if (queryRows != 1) {
		gs.addErrorMessage(gs.getMessage('Selected entitlement does not match your entitlement condition'));
		current.setAbortAction(true);
	}
}
