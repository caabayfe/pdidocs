(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('cmn_rota_esc_step_def');
	gr.addQuery('escalation_set', current.escalation_set);
	gr.addQuery('escalation_level', current.escalation_level);
	gr.setLimit(1);
	if (current.operation() == 'update')
		gr.addQuery('sys_id','!=', current.getUniqueValue());
	gr.query();
	if (gr.hasNext()) {
		var msg = gs.getMessage('Step with escalation level - {0} already exists for escalation set {1}', [current.escalation_level, current.escalation_set.getDisplayValue()]);
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
})(current, previous);
