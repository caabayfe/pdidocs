var applications = ['csm', 'hr', 'itsm', 'global'];

function onLoad() {
    process();
}

function process() {

    if (g_form.getValue('live_agent_enabled') == 'false' || g_scratchpad.disableQueues) {
        disableAllQueues();
    } else {
        enableAllQueues();
    }
}

function disableAllQueues() {
    g_form.setDisplay('transfer_message', false);
    for (var appIndex in applications) {
        disableQueue(applications[appIndex]);
    }
}

function enableAllQueues() {
    g_form.setDisplay('transfer_message', true);
    for (var appIndex in applications) {
        enableQueue(applications[appIndex]);
    }
}

function disableQueue(application) {
    g_form.setDisplay(application + '_fulfiller', false);
    g_form.setDisplay(application + '_queue', false);
}

function enableQueue(application) {
    g_form.setDisplay(application + '_fulfiller', true);
    g_form.setDisplay(application + '_queue', true);
    if (g_form.getValue(application + '_fulfiller') == 'service_workspace') {
        g_form.setValue(application + '_queue', '');
        g_form.setDisabled(application + '_queue', true);
    } else {
        g_form.setDisabled(application + '_queue', false);
    }
}
