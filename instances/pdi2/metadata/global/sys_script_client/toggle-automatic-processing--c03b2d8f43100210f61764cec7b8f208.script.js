function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (oldValue != newValue && newValue === "true") {
        migrateAllFlowQueues();
    }
}

function migrateAllFlowQueues() {
    var provider = g_form.getReference('provider');
    if (!provider)
        return;

    var providerName = provider.getValue('name');
    var queueName = g_form.getValue('queue');
	var providerId = provider.getValue('sys_id');
    if (providerName == 'NowMQ Provider' && queueName.startsWith('flow_engine.')) {
        var queueNames = getFlowEngineQueueNames(providerId);
        if (queueNames == null)
            return;

        g_form.addInfoMessage(new GwtMessage().getMessage("Following queues will migrate from manual jobs to automatic scheduling to process the events: {0} ", queueNames));
    }
}

function getFlowEngineQueueNames(providerId) {
    var flowEngineQueueNames = '';
    var queueGr = getFlowQueues(providerId);
    if (!queueGr.hasNext())
        return null;
    while (queueGr.next())
        flowEngineQueueNames += queueGr.queue + ', ';
    return flowEngineQueueNames.substring(0, flowEngineQueueNames.length - 2);
}

function getFlowQueues(providerId) {
    var queueGr = new GlideRecord('sysevent_queue');
    queueGr.addQuery('queue', 'STARTSWITH', 'flow_engine.');
    queueGr.addQuery('provider', providerId);
    queueGr.addQuery('automatic_processing', false);
    queueGr.query();
    return queueGr;
}
