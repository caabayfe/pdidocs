if (!pm.isZboot()) {
	// set the default to 'complete' (applicable for new SLA definitions)
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'contract_sla');
	gr.addQuery('element', 'reset_action');
	gr.query();
	if (gr.next()){
		gr.setValue('default_value','complete');
		gr.update();
	}
	// updates existing SLA defitions
	var slaGr = new GlideRecord('contract_sla');
	slaGr.setValue('reset_action', 'complete');
	slaGr.updateMultiple();
}
