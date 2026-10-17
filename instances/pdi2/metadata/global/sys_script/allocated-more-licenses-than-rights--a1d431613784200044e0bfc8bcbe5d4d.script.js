verifyEntitlements();

function verifyEntitlements() {
	if(current.rights < 0) {
		gs.addErrorMessage(gs.getMessage('Cannot allocate rights as negative number'));
		current.setAbortAction(true);
		return;
	}
	var gr = new GlideRecord('alm_entitlement');
	gr.addQuery('licensed_by', current.sys_id);
	gr.query();
	var actualRows = gr.getRowCount();
	if (actualRows > current.rights) {
		gs.addErrorMessage(gs.getMessage('Cannot allocate more licenses than rights'));
		current.setAbortAction(true);
	}
}
