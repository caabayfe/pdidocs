(function executeRule(current, previous) {

    var parentRecord = new GlideRecord('sysevent_queue');
    if (!parentRecord.get(current.getValue('queue_ref'))) {
        gs.addErrorMessage(gs.getMessage('Queue not found')); // this will never hit, due to cascade delete
        current.setAbortAction(true);
        return;
    }
	var provider = 'Event Provider';
	if (parentRecord.provider)
		provider = parentRecord.provider.getRefRecord().name;

    var maxJobs = new SNC.ProcessingFrameworkUtil().getMaxJobsAllowed(parentRecord.getValue('processing_order'),
		provider);
    if (current.getValue('requested_jobs') > maxJobs) {
        gs.addErrorMessage(gs.getMessage('Requested jobs {0}, exceed maximum allowed jobs.', current.requested_jobs));
        current.setAbortAction(true);
        return;
    }
    // validate already same action is pending with Orchestrator? if true, abort the update
    var gr = new GlideRecord('sys_orchestrator_action');
    gr.addQuery('table_name', 'sysevent_queue_config');
    gr.addQuery('identifier', current.getUniqueValue());
    gr.addQuery('action', 'parallelism_changed');
    gr.addQuery('state', 'pending');
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Previous updates on requested jobs for this queue are in progress, please try again after some time."));
        current.setAbortAction(true);
    } else
        new SNC.OrchestratorAction().parallelismChanged(current, parentRecord.getValue('queue')); // insert new Orchestrator action entry
})(current, previous);
