function onLoad() {
    if (g_form.getValue('job_id') == 'd43002a443233110114b9c0d7ab8f291') {
        showSyseventProcessingFrameworkMessage();
        return;
    }

    if (g_form.getValue('job_id') == '9dc04ab4eb0212100679ed9c425228cf') {
        showNowMQProcessingFrameworkMessage();
        return;
    }
}

function showSyseventProcessingFrameworkMessage() {
    var triggerName = g_form.getValue('name');
    if (!triggerName || !triggerName.startsWith('events process')) return;

    var queueName = "DEFAULT";
    if (triggerName != 'events process 0') {
        // extracting queue name from trigger name. Trigger Name pattern is 'events process <queue-name>'.
        queueName = encodeURIComponent(triggerName.replace(/^events\sprocess\s/g, ''));
    }

    showMessage(queueName);
}

function showNowMQProcessingFrameworkMessage() {
    var triggerName = g_form.getValue('name');
    var foundMatch = /Flow Engine \[[0-9]+-[0-9]+\] Event Handler/.test(triggerName);
    if (!triggerName || !(triggerName == 'Flow Engine Event Handler' ||
            triggerName == 'Flow Engine Interactive Event Handler' || foundMatch)) return;

    var queueName = "";
    if (foundMatch) {
        queueName = 'flow_engine.' + triggerName.match(/\[[0-9]+-[0-9]+\]/);
		showMessage(queueName);
		return;
	}

    if (triggerName == 'Flow Engine Event Handler')
        queueName = "flow_engine.[0-9]";

    if (triggerName == 'Flow Engine Interactive Event Handler')
        queueName = "flow_engine.[0-2]";

    showMessage(queueName);
}

function showMessage(queueName) {
    // preparing queue registration page link for that queue.
    var queueFormPageLink = '<a href="sysevent_queue.do?sysparm_query=queue%3D' + queueName + '">' + getMessage("Queue Registration") + '</a>';
    // preparing queue registry link.
    var queueRegistryLink = '<a href="sysevent_queue_list.do?">' + getMessage("Queue Registry") + '</a>';

    var message = nowapi.g_i18n.format(getMessage('Please do not make any changes here. To change the job configuration, update the configuration in {queueFormPage} page or refer {queueRegistryList}.'), {
        queueFormPage: queueFormPageLink,
        queueRegistryList: queueRegistryLink
    });
    g_form.addInfoMessage(message);
}
