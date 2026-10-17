function onLoad() {
    var queue = g_form.getReference('queue_ref');
    var ga = new GlideAjax('ProcessingFrameworkUtil');
    ga.addParam('sysparm_name', 'getMaxAllowedJobCount');
    ga.addParam('sysparm_processingOrder', queue.processing_order);
    ga.addParam('sysparm_queueProvider', g_scratchpad.provider);
    ga.getXML(ajaxCallback);
}

function ajaxCallback(response) {
    var maxJobsAllowed = response.responseXML.documentElement.getAttribute("answer");
    g_scratchpad.PF_maxJobsAllowed = maxJobsAllowed; // store the value which can be used onChange event
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
