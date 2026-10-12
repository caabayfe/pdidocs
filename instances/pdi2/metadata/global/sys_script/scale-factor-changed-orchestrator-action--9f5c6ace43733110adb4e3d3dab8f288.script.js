(function executeRule(current, previous) {
    if (previous.automatic_processing == false)
        return;

    // validate already same action is pending with Orchestrator? if true, abort the update
    var gr = new GlideRecord('sys_orchestrator_action');
    gr.addQuery('table_name', 'sysevent_queue');
    gr.addQuery('identifier', current.getUniqueValue());
    gr.addQuery('action', 'scale_factor_changed');
    gr.addQuery('state', 'pending');
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Previous updates to job configuration for this queue are in progress, please try again after some time."));
        current.setAbortAction(true);
    } else
        new SNC.OrchestratorAction().scaleFactorChanged(current, current.getValue('queue')); // insert new Orchestrator action entry
})(current, previous);
