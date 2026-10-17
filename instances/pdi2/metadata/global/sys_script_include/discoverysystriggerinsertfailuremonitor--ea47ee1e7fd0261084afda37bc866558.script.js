var DiscoverySysTriggerInsertFailureMonitor = Class.create();

(function() {
    var config = {
        dryRun: gs.getProperty('glide.discovery.schedule_monitoring.dry_run', false) + '' == 'true',
    };

    DiscoverySysTriggerInsertFailureMonitor = {
        findAndHandleInsertFailures: findAndHandleInsertFailures,
        config: config
    };

    function findAndHandleInsertFailures(windowTime, startingDate) {
        config.windowTime = windowTime;
        config.timeWindowStart = calculateTimeWindow(startingDate, (-config.windowTime + (-60 * 60)));
        config.timeWindowEnd = calculateTimeWindow(startingDate, (-60 * 60));

        if (hasOldECCInputInReadyWithinTimeRange(config.timeWindowStart, config.timeWindowEnd)) {
            var failedECCSysIDs = getFailedECCSysID(config.timeWindowStart, config.timeWindowEnd);
            failedECCSysIDs.forEach(failedECCSysID => checkAndRunAgain(failedECCSysID));
        }
    }

    function calculateTimeWindow(startingDate, offsetSeconds) {
        var timeWindow = startingDate ? new GlideDateTime(startingDate) : new GlideDateTime();
        timeWindow.addSeconds(offsetSeconds);

        return timeWindow;
    }

    function hasOldECCInputInReadyWithinTimeRange(timeWindowStart, timeWindowEnd) {
        var eccGr = new GlideRecord('ecc_queue');
        eccGr.addQuery('queue', 'input');
        eccGr.addNotNullQuery('agent_correlator');
        eccGr.addQuery('state', 'ready');
        eccGr.addQuery('sys_created_on', '>=', timeWindowStart + '');
        eccGr.addQuery('sys_created_on', '<=', timeWindowEnd + '');
        eccGr.setNoCount();
        eccGr.setLimit(1);
        eccGr.query();

        return eccGr.hasNext();
    }

    function getFailedECCSysID(timeWindowStart, timeWindowEnd) {
        var failures = [];

        var logGr = new GlideRecord('syslog');
        logGr.addQuery('message', 'STARTSWITH', 'FAILED TRYING TO EXECUTE ON CONNECTION');
        logGr.addQuery('message', 'CONTAINS', 'INSERT INTO sys_trigger');
        logGr.addQuery('level', '2');
        logGr.addQuery('sys_created_on', '>=', timeWindowStart + '');
        logGr.addQuery('sys_created_on', '<=', timeWindowEnd + '');
        logGr.setNoCount();
        logGr.query();

        while (logGr.next()) {
            var logMessage = logGr.message + ''; // Get the log message
            var sysIdMatch = logMessage.match(/[a-f0-9]{32}/i);

            if (sysIdMatch) {
                var sysId = sysIdMatch[0]; // Extract the sys_id
                failures.push(sysId);
            }
        }

        return failures;
    }

    function checkAndRunAgain(eccSysId) {
        var eccGr = new GlideRecord('ecc_queue');
        if (eccGr.get('sys_id', eccSysId)) {
            var discoveryStatusGr = new GlideRecord('discovery_status');

            if (discoveryStatusGr.get('sys_id', eccGr.agent_correlator + '')) {
                var message = sn_i18n.Message.getMessage('global-discovery', 'ecc_queue {sysId} previously failed to process. Attempting reprocessing now.', {
                    sysId: eccSysId
                });

                var dlog = new DiscoveryLogger(eccGr.agent_correlator);
                dlog.info(message, 'DiscoverySysTriggerInsertFailureMonitor', eccSysId);

                if (config.dryRun) {
                    message = sn_i18n.Message.getMessage('global-discovery', 'Found unprocessed ecc_queue input {sysId} in "dry run" mode. Set "glide.discovery.schedule_monitoring.dry_run" to true to automatically process future sys_trigger insert failures', {
                        sysId: eccSysId
                    });
                    dlog.info(message, 'DiscoverySysTriggerInsertFailureMonitor', eccSysId);
                } else {
                    try {
                        var script = "var job = new DiscoverySensorJob();\njob.process();";
                        var jobName = DiscoverySensorJob.buildJobNameFromEcc(eccGr);
                        var sched = new SchedulePriorityECCJob(jobName, eccGr, script);
                        sched.schedule();

                        message = sn_i18n.Message.getMessage('global-discovery', 'Re-inserting sys_trigger for ecc queue with insert failure: {sysId}', {
                            sysId: eccSysId
                        });
                        dlog.info(message, 'DiscoverySysTriggerInsertFailureMonitor', eccSysId);
                    } catch (error) {
                        gs.error('Exception: {0} occurred when re-inserting sys_trigger for ecc queue with insert failure: {1}', [error, eccSysId]);
                    }
                }
            }
        }
    }
})();
