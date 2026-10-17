function demigrateQueue() {
    if (g_form.modified) {
        g_form.clearMessages();
        g_form.addWarningMessage(getMessage('Changes that you made are not been saved, please save before performing any action.'));
        return false;
    }

    var providerName = 'Event Provider';
    var provider = g_form.getReference('provider');
    if (provider)
        providerName = provider.getValue('name');

    answer = getConfirmation(providerName, g_form.getValue('queue'));
    if (answer == false)
        return false;

    // Call the UI action and skip the 'onclick' function
    gsftSubmit(null, g_form.getFormElement(), 'sysverb_demigrate_queue');
}

// Code that runs without 'onclick' Ensure call to server-side function with no browser errors
if (typeof window == 'undefined') {
    var provider = current.provider;
    if (provider && provider.getRefRecord().name == 'NowMQ Provider' && current.queue.startsWith('flow_engine.'))
        updateFlowQueue();
    else
        updateQueue(current);
}

function updateFlowQueue() {
    var queueGr = getFlowQueues();
    while (queueGr.next())
        updateQueue(queueGr);
}

function updateQueue(queueGr) {
    queueGr.automatic_processing = false;
    queueGr.update();
    new SNC.OrchestratorAction().deProvisionEntity(queueGr, queueGr.getValue('queue'));
    action.setRedirectURL('sysevent_queue_list.do');
}

function getConfirmation(providerName, queueName) {
    var answer = true;
    if (providerName == 'NowMQ Provider' && queueName.startsWith('flow_engine.')) {
        var queueNames = getFlowEngineQueueNames();
        answer = confirm(new GwtMessage().getMessage("Following queues will roll back from automatic to manual jobs scheduling to process the events: \n\n {0} \nDo you want to continue?", queueNames));
    } else {
        answer = confirm(new GwtMessage().getMessage("Queue will roll back from automatic to manual jobs scheduling to process the events. Do you want to continue?"));
    }
    return answer;
}

function getFlowEngineQueueNames() {
    var flowEngineQueueNames = '';
    var queueGr = getFlowQueues();
    while (queueGr.next())
        flowEngineQueueNames += '    >  ' + queueGr.queue + '\n';

    return flowEngineQueueNames;
}

/**
 * Get all the flow_engine queues that have automatic processing enabled.
 */
function getFlowQueues() {
    var queueGr = new GlideRecord('sysevent_queue');
    queueGr.addQuery('queue', 'STARTSWITH', 'flow_engine.');
    queueGr.addQuery('provider', '3ccf4464431212108da9a574a9b8f2fb');
    queueGr.addQuery('automatic_processing', true);
    queueGr.query();
    return queueGr;
}
