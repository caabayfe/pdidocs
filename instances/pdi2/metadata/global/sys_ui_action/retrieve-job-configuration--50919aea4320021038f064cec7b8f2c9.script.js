function scanProcessors() {
    g_form.clearMessages();
    var queue = g_form.getValue('queue');
    if (!queue) {
        g_form.addWarningMessage(getMessage('Enter the queue name to retrieve the job configuration.'));
        return;
    }
    if (g_form.getBooleanValue('automatic_processing') == false) {
        g_form.addWarningMessage(getMessage('Select automatic job scheduling to retrieve the job configuration.'));
        return;
    }
    var config = getConfiguration(queue);
    if (Object.keys(config).length > 0) {
        g_form.setValue('processing_order', config['processing_order']);
        g_form.setValue('job_config', config['job_config']);
        g_form.setValue('job_config_value', config['job_config_value']);
        g_form.addInfoMessage(getMessage('The job configuration has been populated; please validate and update as necessary.'));
    } else
        g_form.addWarningMessage(getMessage('No valid job configurations for the queue.'));
}

function getActiveProcessors(queue) {
    var values = {
        'sysIds': [],
        'processorType': new Set()
    };
    var gr = new GlideRecord('sys_event_processor');
    gr.addQuery('queue', queue);
    gr.addQuery('state', 'active');
    gr.query();
    while (gr.next()) {
        values['sysIds'].push(gr.getValue('processor'));
        values['processorType'].add(gr.getValue('processor_type'));
    }
    return values;
}

function getConfiguration(queue) {
    var provider = g_form.getReference('provider');
    var providerName = 'Event Provider';
    if (provider)
        providerName = provider.name;

    if (providerName == 'NowMQ Provider' && queue.startsWith('flow_engine.'))
        return getNowMQConfiguration(queue);
    return getSysEventConfiguration(queue);
}

function getFlowJobCount(queue) {
    var matches = queue.match(/\d*-\d*/);
    if (!matches)
        return 0;

    var priority = matches[0].split('-')[1];
    var triggerGr = new GlideRecord('sys_trigger');
    triggerGr.addQuery('parent', null);
    triggerGr.addQuery('job_context', "CONTAINS", 'fcQueue=flow_engine');
    triggerGr.addQuery('job_context', "CONTAINS", 'fcHandleEventUpToPriority=' + priority);
    triggerGr.addQuery('job_id', '88d87a408f3222003bf174f137bdeeb5');
    triggerGr.query();

    var count = 0;
    while (triggerGr.next()) count++;
    getRepeatInterval(triggerGr);
    return count;
}

function getNowMQConfiguration(queue) {
    var jobCount = getFlowJobCount(queue);
    if (jobCount == 0)
        return {};
    return {
        'processing_order': 'parallel',
        'job_config': 'jobs_per_node',
        'job_config_value': jobCount
    };
}

function getSysEventConfiguration(queue) {
    var processorValues = getActiveProcessors(queue);
    if (processorValues['processorType'].length > 1) {
        // when queue has mix of both delegated and dedicated processors
        return {};
    }
    var parentTriggers = new Set();
    var childTriggers = new Set();
    var gr = new GlideRecord('sys_trigger');
    gr.addQuery('sys_id', 'IN', processorValues['sysIds'].toString());
    gr.query();
    while (gr.next()) {
        if (gr.getValue('parent')) {
            parentTriggers.add(gr.getValue('parent'));
        } else {
            childTriggers.add(gr.getValue('sys_id'));
        }
    }
    if (parentTriggers.size > 0 && childTriggers.size > 0) {
        // when queue has both parent and standalone sys_triggers		
        return {};
    }
    if (parentTriggers.size > 0 && childTriggers.size == 0) {
        getRepeatInterval(gr);
        // when queue has parent job and these jobs could be either dedicated or delegated.
        return {
            'processing_order': 'parallel',
            'job_config': 'jobs_per_node',
            'job_config_value': parentTriggers.size
        };
    } else if (parentTriggers.size == 0 && childTriggers.size > 0) {
        getRepeatInterval(gr);
        //when queue only has standalone jobs
        if (processorValues['processorType'].has('delegated')) {
            // these jobs are delegated
            return {
                'processing_order': 'parallel',
                'job_config': 'job_count',
                'job_config_value': childTriggers.size
            };
        } else {
            if (childTriggers.size > 1) {
                // if there are more than one dedicated jobs
                return {
                    'processing_order': 'parallel',
                    'job_config': 'job_count',
                    'job_config_value': childTriggers.size
                };
            } else {
                // if only one dedicated job exists
                return {
                    'processing_order': 'sequential',
                    'job_config': 'job_count',
                    'job_config_value': childTriggers.size
                };
            }
        }
    } else {
        //case where we have both parent job and standalone job
        return {};
    }
}

function getRepeatInterval(triggerGr) {
    var type = triggerGr.getValue('trigger_type');
    // Repeat or Interval
    if (type == '1' || type == '10') {
        var ga = new GlideAjax('ProcessingFrameworkUtil');
        ga.addParam('sysparm_name', 'getDuration');
        ga.addParam('sysparm_repeatInterval', triggerGr.getValue('repeat'));
        ga.getXML(ajaxCallback);
    }
}

function ajaxCallback(response) {
    var duration = response.responseXML.documentElement.getAttribute("answer");
    g_form.setValue('poll_interval', duration);
}
