var gr = new GlideRecord('clm_m2m_contract_and_terms');
gr.addQuery('contract', current.contract);
gr.addQuery('terms_and_conditions', current.terms_and_conditions);
gr.addQuery('sys_id', '!=', current.sys_id);
gr.query();
if(gr.next()) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Prevented duplicate Terms and Conditions \"{0}\" for Contract {1}", [gr.getDisplayValue('terms_and_conditions'), gr.getDisplayValue('contract')]));
}
