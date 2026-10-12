function onLoad() {

    // Check the sysparam which will be passed from event register form
    var autoProcessing = getParameterValue('sysparm_automaticProcessing');
    if (autoProcessing) {
        g_form.setValue('automatic_processing', autoProcessing);
        var queueName = decodeURIComponent(getParameterValue('sysparm_queueName'));
        if (queueName && queueName !== "undefined") {
            g_form.setValue('queue', queueName);
        }
        var suffixName = decodeURIComponent(getParameterValue('sysparm_suffix'));
        if (suffixName && suffixName !== "undefined") {
            g_form.setValue('suffix', suffixName);
        }
    }
    if (g_form.isNewRecord()) {
        if (g_scratchpad.scope != 'global') {
            var queueMaxLength = g_form.getControl('queue').getAttribute('maxlength');
            var suffixControl = g_form.getControl('suffix');
            suffixControl.setAttribute('maxlength', (queueMaxLength - g_scratchpad.scope.length - 1));
        }
        return;
    } else if (g_scratchpad.processing_framework_feature == 'false' || g_form.getValue('automatic_processing') === 'false') {
        g_form.setReadOnly('queue', true);
        g_form.hideRelatedList("sysevent_queue_config");
        return;
    }
    if (g_form.getValue('automatic_processing') === 'true')
        g_form.setReadOnly('automatic_processing', true);
    g_form.setReadOnly('queue', true);
    g_form.setReadOnly('processing_order', true);
    g_form.setReadOnly('job_config', true);
    g_form.setReadOnly('job_config_value', true);
    g_form.setReadOnly('poll_interval', true);
    // Get the status of the queue
    var gr = new GlideRecord('sysevent_queue_config');
    gr.addQuery('queue_ref', g_form.getUniqueValue());
    gr.query();
    if (!gr.next())
        g_form.addInfoMessage(getMessage('Queue is in provisioning state. Reload the form for the latest status.'));
    else if (gr.getValue('status') == 'error')
        g_form.addErrorMessage(getMessage('The queue provisioning is failed, please click on retry.'));
    else if (parseInt(gr.getValue('requested_jobs')) > parseInt(gr.getValue('actual_jobs')))
        g_form.addWarningMessage(getMessage('Due to instance compute availability, the actual number of jobs created is less than the requested number. Please check the queue details for additional information.'));
    // enable job config for parallel, only when queue is active
    if (gr.getValue('status') == 'active') {
        g_form.setReadOnly('poll_interval', false);
        if (g_form.getValue('processing_order') == 'parallel') {
            g_form.setReadOnly('job_config', false);
            g_form.setReadOnly('job_config_value', false);
        }
    }
}

function getParameterValue(name) {
    var url = top.location.href;
    var value = new URLSearchParams(url).get(name);
    if (value) {
        return value;
    }
    if (!value) {
        var gUrl = new GlideURL();
        gUrl.setFromCurrent();
        value = gUrl.getParam(name);
        return value;
    }
}
