(function executeRule(current, previous) {
    if (previous.automatic_processing == false)
        return;
    // validate the poll interval value
    var gd = new GlideDateTime(current.getValue('poll_interval'));
    if (gd.getNumericValue() < 1) {
        current.setValue('poll_interval', previous.getValue('poll_interval'));
        return;
    }
    // validate already same action is pending with Orchestrator? if true, abort the update
    var gr = new GlideRecord('sys_orchestrator_action');
    gr.addQuery('table_name', 'sysevent_queue');
    gr.addQuery('identifier', current.getUniqueValue());
    gr.addQuery('action', 'job_config_changed');
    gr.addQuery('state', 'pending');
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Previous updates to job configurations for this queue are in progress, please try again after some time."));
        current.setAbortAction(true);
    } else
        new SNC.OrchestratorAction().jobConfigurationChanged(current, current.getValue('queue')); // insert new Orchestrator action entry
})(current, previous);
