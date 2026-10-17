(function executeRule(current, previous) {
    var util = new SNC.ProcessingFrameworkUtil();
    if (JSUtil.nil(current.queue) || current.queue == 'NULL' || current.queue.trim() == '') {
        gs.addErrorMessage(gs.getMessage('Creating queue without name is not allowed.'));
        current.setAbortAction(true);
    } else if (util.isQueueExists(current.queue)) {
        gs.addErrorMessage(gs.getMessage('Queue "{0}" already exists', current.queue));
        current.setAbortAction(true);
    } else if (util.isQueueNameRestricted(current.queue)) {
        gs.addErrorMessage(gs.getMessage('"{0}" is a reserved queue name.', current.queue));
        current.setAbortAction(true);
    } else if (!util.isQueueNameInAllowedFormat(current.queue, current.provider.getDisplayValue())) {
        gs.addErrorMessage(gs.getMessage('"{0}" is either a reserved queue name or is not in allowed format. Allowed formats are name.* or name.[0-\\d]', current.queue));
        current.setAbortAction(true);
    }
    // validate the poll interval value
    var gd = new GlideDateTime(current.getValue('poll_interval'));
    if (gd.getNumericValue() < 1) {
        gs.addErrorMessage(gs.getMessage('Invalid value for Poll Interval'));
        current.setAbortAction(true);
    }

    var providerName = current.provider.name;
    if (providerName == 'NowMQ Provider' && current.queue.startsWith('flow_engine.'))
        current.sys_policy = 'read';
})(current, previous);
