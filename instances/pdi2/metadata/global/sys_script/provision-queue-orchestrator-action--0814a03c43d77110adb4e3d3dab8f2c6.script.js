(function executeRule(current, previous) {
    new SNC.OrchestratorAction().provisionEntity(current, current.getValue('queue'));

    if (current.provider.sys_id == '3ccf4464431212108da9a574a9b8f2fb') {
        var queueGr = new GlideRecord('sysevent_queue');
        queueGr.setWorkflow(false);
        queueGr.addQuery('queue', 'STARTSWITH', 'flow_engine.');
        queueGr.addQuery('provider', current.provider.sys_id);
        queueGr.addQuery('automatic_processing', false);
        queueGr.query();

        while (queueGr.next()) {
            queueGr.automatic_processing = true;
            queueGr.update();
            new SNC.OrchestratorAction().provisionEntity(queueGr, queueGr.getValue('queue'));
        }
    }
})(current, previous);
