verifyEntitlements();

function verifyEntitlements() {
	var gr = new GlideRecord("clm_m2m_contract_asset");
	gr.addQuery("asset", current.licensed_by);
	gr.addQuery("contract.license_type", 'enterprise');

	gr.addQuery("contract.starts", "<=", new GlideDateTime().getDate());
	var ce = gr.addQuery("contract.ends", ">=", new GlideDateTime().getDate());
	ce.addOrCondition("contract.ends", "");

	gr.addQuery("added", "<=", new GlideDateTime().getDate());
	var ae = gr.addQuery("removed", ">=", new GlideDateTime().getDate());
	ae.addOrCondition("removed", "");

	gr.query();
	if (!gr.next()) {
		gr = new GlideRecord('alm_entitlement');
		gr.addQuery('licensed_by', current.licensed_by);
		gr.query();
		var actualRows = gr.getRowCount();

		if (actualRows > current.licensed_by.rights
			|| (current.licensed_by.changes() && actualRows == current.licensed_by.rights)) {
			gs.addErrorMessage(gs.getMessage('Cannot allocate more licenses than rights'));
			current.setAbortAction(true);
		}
	}
}
