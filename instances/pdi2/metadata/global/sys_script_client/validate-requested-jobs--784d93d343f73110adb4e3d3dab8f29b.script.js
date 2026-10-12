function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var jobCount = g_form.getIntValue('requested_jobs');
    if (jobCount <= 0) {
        g_form.addErrorMessage(getMessage('The job configuration is invalid, requested jobs must be greater than zero.'));
        g_form.setValue('requested_jobs', oldValue);
        return;
    }
    if (typeof g_scratchpad.PF_maxJobsAllowed === 'undefined') {
        var queue = g_form.getReference('queue_ref');
        var ga = new GlideAjax('ProcessingFrameworkUtil');
        ga.addParam('sysparm_name', 'getMaxAllowedJobCount');
        ga.addParam('sysparm_processingOrder', queue.processing_order);
        ga.addParam('sysparm_queueProvider', g_scratchpad.provider);
        ga.getXML(ajaxCallback);
    } else
        displayFieldMsg(g_scratchpad.PF_maxJobsAllowed);
}

function ajaxCallback(response) {
    var maxJobsAllowed = response.responseXML.documentElement.getAttribute("answer");
    g_scratchpad.PF_maxJobsAllowed = maxJobsAllowed;
    displayFieldMsg(maxJobsAllowed);
}

function displayFieldMsg(maxJobs) {
    var text = 'The maximum number of jobs allowed for this queue is: {0}';
    if (g_scratchpad.provider == 'NowMQ Provider')
        text = 'The maximum number of jobs allowed per node for this queue is: {0}';

    var msg = formatMessage(getMessage(text), maxJobs);
    if (g_form.getIntValue('requested_jobs') > maxJobs)
        g_form.showFieldMsg('requested_jobs', msg, 'error');
    else
        g_form.showFieldMsg('requested_jobs', msg);
}
