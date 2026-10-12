(function executeRule(current, previous /*null when async*/ ) {

    // Only proceed if this is one of our target properties
    if (current.name != 'glide.scan.parallel_scan_enabled' && current.name != 'glide.scan.queue.enabled') {
        return;
    }

    var parallelScanEnabled;
    var queueEnabled;

    // If we're updating the parallel scan property
    if (current.name == 'glide.scan.parallel_scan_enabled') {
        parallelScanEnabled = current.value == 'true';

        // Get the current value of queue enabled
        var queueProperty = new GlideRecord('sys_properties');
        queueProperty.addQuery('name', 'glide.scan.queue.enabled');
        queueProperty.query();

        if (queueProperty.next()) {
            queueEnabled = queueProperty.value == 'true';
        } else {
            // If property doesn't exist yet, assume default is false
            queueEnabled = true;
        }
    }
    // If we're updating the queue enabled property
    else if (current.name == 'glide.scan.queue.enabled') {
        queueEnabled = current.value == 'true';

        // Get the current value of parallel scan enabled
        var parallelProperty = new GlideRecord('sys_properties');
        parallelProperty.addQuery('name', 'glide.scan.parallel_scan_enabled');
        parallelProperty.query();

        if (parallelProperty.next()) {
            parallelScanEnabled = parallelProperty.value == 'true';
        } else {
            // If property doesn't exist yet, assume default is false
            parallelScanEnabled = true;
        }
    }

    // Validate the combination
    if (parallelScanEnabled && !queueEnabled) {
        gs.addErrorMessage(gs.getMessage('Error: Parallel scanning requires queue processing. Set glide.scan.queue.enabled to true to use parallel scanning.'));
        current.setAbortAction(true);
    }

})(current, previous);
