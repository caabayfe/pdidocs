(function executeRule(current, previous) {
	if (!current.active)
		return;

	var modelLifecycleGr = new GlideRecord('cmdb_model_lifecycle');
	modelLifecycleGr.addQuery('source', current.source);
	modelLifecycleGr.addQuery('lifecycle_type', current.lifecycle_type);
	modelLifecycleGr.addQuery('lifecycle_phase', current.lifecycle_phase);
	modelLifecycleGr.addQuery('model', current.model);
	modelLifecycleGr.addQuery('active', true);
	modelLifecycleGr.query();

	if (modelLifecycleGr.next() && modelLifecycleGr.getValue('sys_id') !== current.getValue('sys_id')) {
		gs.addErrorMessage(gs.getMessage('A record with the same combination of model, lifecycle type, lifecycle phase and source already exists'));
		current.setAbortAction(true);
	}
})(current, previous);
