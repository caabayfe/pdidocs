(function() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'sysrule_escalate_history');
	gr.addQuery('element', 'escalation');
	gr.addNullQuery('reference_cascade_rule');
	gr.setWorkflow(false);
	gr.query();
	if (gr.next()) {
		gr.setValue('reference_cascade_rule', 'delete');
		gr.update();
	}
    return;
})();
