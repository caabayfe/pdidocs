(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.processing_framework_feature = gs.getProperty('com.glide.processing.framework.enabled', 'true');
    if (g_scratchpad.processing_framework_feature == 'false')
        return; // No check when the feature is disabled.
    var queueRegistry = gs.getMessage("Queue Registration");
    if (current.isNewRecord()) {
        var listViewLink = '<a href="sysevent_queue_list.do">' + queueRegistry + '</a>';
        var newRecordMsg = gs.getMessage('To process events in a custom queue, leverage {0} and enable automatic job scheduling to offload your operational overhead.', listViewLink);
        gs.addInfoMessage(newRecordMsg);
        return;
    }
    // For the existing events
    if (!current.getValue('queue') || current.getValue('queue') == 'DEFAULT')
        return;
    if (new SNC.ProcessingFrameworkUtil().isQueueNameRestricted(current.getValue('queue')))
        return;
    if (!new SNC.ProcessingFrameworkUtil().isQueueExists(current.queue)) {
        var queueName = current.getValue('queue');
        var recordScope = current.sys_scope.scope;
        var link = '';
        var message = '';
        var scopeParamGlobal = '&sysparm_transaction_scope=global';
        var scopeParamApp = '&sysparm_transaction_scope=' + encodeURIComponent(current.sys_scope);
        var suffixParamPrefix = '&sysparm_suffix=';
        if (!g_scratchpad.scope && recordScope == 'global') {
            addCustomQueueMessage(queueName, '', scopeParamGlobal);
            return;
        }
        if (recordScope != g_scratchpad.scope) return;
        if (queueName.startsWith(g_scratchpad.scope + '.')) {
            var suffix = queueName.substring(g_scratchpad.scope.length + 1);
            suffixParam = suffixParamPrefix + encodeURIComponent(suffix);
            addCustomQueueMessage(queueName, suffixParam, scopeParamApp);
            return;
        }
        message = gs.getMessage('This event has been configured to process in a custom Queue. Select the queue registry options given below in your app scope with automatic job scheduling to offload your operational overhead.', link);
        gs.addInfoMessage(message);
        suffixParam = suffixParamPrefix + encodeURIComponent(queueName);
        var combinedQueueName = g_scratchpad.scope + '.' + queueName;
        link = getLink(combinedQueueName, suffixParam, scopeParamApp, gs.getMessage("Register Queue in App Scope"));
        message = gs.getMessage('Recommended: {0} - In this option, there is a change in the Queue name. Ensure to update the new Queue name in your application usage.', link);
        gs.addInfoMessage(message);
        link = getLink(queueName, '', scopeParamGlobal, gs.getMessage("Register Queue in Global Scope"));
        message = gs.getMessage('{0}. Ensure to provide a unique queue name to avoid name conflicts with other applications.', link);
        gs.addInfoMessage(message);

    }
})(current, previous);

function getLink(queueName, suffixParam, scopeParam, queueRegistry) {
    return '<a href="sysevent_queue.do?sys_id=-1&sysparm_queueName=' + encodeURIComponent(queueName) + '&sysparm_automaticProcessing=false' + scopeParam + suffixParam + '">' + queueRegistry + '</a>';
}

function addCustomQueueMessage(queueName, suffixParam, scopeParam) {
    var link = getLink(queueName, suffixParam, scopeParam, gs.getMessage("Queue Registration"));
    message = gs.getMessage('This event has been configured to process in a custom queue. Register the queue {0} with automatic job scheduling to offload your operational overhead.', link);
    gs.addInfoMessage(message);
}
