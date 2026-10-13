gs.include('EvtMgmtCommons');
var EvtMgmtProcessCoordinator = Class.create();
EvtMgmtProcessCoordinator.prototype = {
    initialize: function() {

    },
    NAME_PREFIX: 'Event Management - process events',
    RECURRING_NAME_PREFIX: 'Recurring.Event Management - process events',
    evtMgmtCommons: new EvtMgmtCommons(),
    // To prevent EM processing jobs to starve for longer time because of few EM processing jobs not updating
    EM_PROCESSING_JOBS_MAX_WAIT_TIME_SECS: GlideProperties.get('evt.mgmt.processing.jobs.max.wait.time.secs', 120),
    // To prevent infinite loop waiting for EM jobs to update status
    COORDINATOR_JOB_MAX_WAIT_TIME_SECS: GlideProperties.get('evt.mgmt.coordinator.job.max.wait.time.secs', 600),
    //Number of attempts to verify whether expected,actual and stored job counts are same.
    COORDINATOR_JOB_VERIFY_ATTEMPTS: GlideProperties.getInt('evt.mgmt.coordinator.job.verify.attempts', 3),
    // The time interval between verify attempts in seconds.
    COORDINATOR_JOB_VERIFY_ATTEMPTS_WAIT_TIME_SECS: GlideProperties.getInt('evt.mgmt.coordinator.job.verify.attempts.wait.time.secs', 5),
    //Enable/Disable coordination. 
    EM_PROCESSING_DISABLE_COORDINATION: GlideProperties.getBoolean('evt_mgmt.event_processor_disable_coordination', false),
    USE_JOB_CLASSIFICATION_FOR_SYS_TRIGGER: GlideProperties.getBoolean('evt_mgmt.event_processing.use_job_classification_for_sys_trigger', true),

    saveActiveJobCount: function(activeJobsCount) {
        var JOB_COUNT = 'em_job_count';
        var gr = new GlideRecord("sa_hash");
        gr.addQuery('name', JOB_COUNT);
        gr.query();
        if (gr.next()) {
            gr.setValue('hash', activeJobsCount);
            gr.update();
        } else {
            gr.initialize();
            gr.setValue('name', JOB_COUNT);
            gr.setValue('hash', activeJobsCount);
            gr.insert();
        }
    },

    createNewJobs: function(count, enableMultiNode, duration) {
        var PROPERTIES = {
            EVENT_JOB_COUNT: "evt_mgmt.event_processor_job_count",
            ENABLE_MULTI_NODE: "evt_mgmt.event_processor_enable_multi_node",
            EVENT_PROCESSING_DELAY: "evt_mgmt.events_processing_delay_sec",
        };

        var gr = new GlideRecord("sys_properties");
        var qc = gr.addQuery("name", PROPERTIES.EVENT_JOB_COUNT);
        qc.addOrCondition("name", PROPERTIES.ENABLE_MULTI_NODE);
        qc.addOrCondition("name", PROPERTIES.EVENT_PROCESSING_DELAY);
        gr.query();

        // If provided - use given argument, and if not then take their value from sys_properties 
        while (gr.next()) {
            var propertyName = gr.getValue("name");
            var propertyValue = gr.getValue("value");

            switch (propertyName) {
                case PROPERTIES.EVENT_JOB_COUNT:
                    if (typeof count === 'undefined') {
                        count = propertyValue;
                    }
                    break;
                case PROPERTIES.ENABLE_MULTI_NODE:
                    if (typeof enableMultiNode === 'undefined') {
                        enableMultiNode = propertyValue;
                    }
                    break;
                case PROPERTIES.EVENT_PROCESSING_DELAY:
                default:
                    if (typeof duration === 'undefined') {
                        duration = propertyValue;
                    }
                    break;
            }
        }

        var processEventsJobs = ProcessEventsJobs.get();
        return processEventsJobs.createNewJobs(count, enableMultiNode, duration);
    },

    getMinLastUpdatedTime: function() {
        var existingJobs = new GlideAggregate('sys_trigger');
        // On multi node instance and multi processing is disabled, EM jobs have system id as empty
        // On multi node instance and multi processing is enabled, EM jobs will have system id as active nodes
        var orCondition = existingJobs.addQuery('system_id', '=', "");
        orCondition.addOrCondition('system_id', '!=', 'ACTIVE NODES');

        if (this.USE_JOB_CLASSIFICATION_FOR_SYS_TRIGGER) {
            existingJobs.addQuery('job_classification', 'STARTSWITH', this.RECURRING_NAME_PREFIX);
        } else {
            existingJobs.addQuery('name', 'STARTSWITH', this.NAME_PREFIX);
        }

        existingJobs.addAggregate('MIN', 'sys_updated_on');
        existingJobs.query();
        if (existingJobs.next()) {
            return new GlideDateTime(existingJobs.getAggregate('MIN', 'sys_updated_on'));
        }
        return new GlideDateTime();
    },

    process: function() {
        // Skip coordination in case the property is true. 
        if (this.EM_PROCESSING_DISABLE_COORDINATION == true) {
            return;
        }

        var eventProcessor = new SNC.EvtMgmtEventProcessor();
        var activeJobsCount = eventProcessor.readActualJobs();
        var expectedJobsCount = eventProcessor.calculateExpectedJobs(false);
        var jobsInDB = eventProcessor.readStoredJobs();

        for (var i = 0; i < this.COORDINATOR_JOB_VERIFY_ATTEMPTS; i++) {
            // Verifying whether expected,actual and stored job counts are same, Do they need to be synchronized?
            if ((activeJobsCount == expectedJobsCount) && (activeJobsCount == jobsInDB)) {
                this.evtMgmtCommons.addDebugMessage("Expected job count, actual job count, stored job count are same, returning from the job");
                return;
            }
            gs.sleep(this.COORDINATOR_JOB_VERIFY_ATTEMPTS_WAIT_TIME_SECS * 1000);
            expectedJobsCount = eventProcessor.calculateExpectedJobs(true);
        }

        gs.log("Expected EM jobs : " + expectedJobsCount + " Actual EM jobs : " + activeJobsCount + " Jobs in DB : " + jobsInDB);
        var snapshotTime = new GlideDateTime();

        // Maximum time job can wait before updating job count in DB or adjusting the EM jobs as expected
        // It is placed to avoid infinite loop, instead of just waiting for the EM processing jobs to update its state
        // Ideally, coordinator job should never wait for more than 2 minutes.Its a safety valve
        var maxProcessTime = new GlideDateTime();
        maxProcessTime.addSeconds(this.COORDINATOR_JOB_MAX_WAIT_TIME_SECS);

        // Maximum time to wait before all EM processing jobs have updated once to start comparison of job counts
        // After maximum time it will go ahead and update the DB count even if one of the job hasn't updated after snapshot time
        var maxCheckTime = new GlideDateTime();
        maxCheckTime.addSeconds(this.EM_PROCESSING_JOBS_MAX_WAIT_TIME_SECS);

        // Protection for the coordinator job to not be in infinite loop if EM processing jobs not responding/stuck
        while (maxProcessTime.after(new GlideDateTime())) {
            // Query the sys trigger table for the EM processing jobs to check whether they have run after snapshot time
            var minUpdateTime = this.getMinLastUpdatedTime();

            // Check whether all jobs have updated atleast once after the snapshot time
            // If it is waiting for more than maxcheckTime(max allowed time), forcing to compare irrespective of whether EM jobs have run atleast once
            if (snapshotTime.before(minUpdateTime) || new GlideDateTime().after(maxCheckTime)) {
                this.evtMgmtCommons.addDebugMessage("All the event processing jobs have been updated after snapshot time : " + snapshotTime);
                expectedJobsCount = eventProcessor.calculateExpectedJobs(false);
                activeJobsCount = eventProcessor.readActualJobs();
                // Expected jobs and active jobs need to be same with logic of BR
                // If they are not same, some corner condition has hit and we need to adjust them correctly
                if (expectedJobsCount != activeJobsCount) {
                    gs.error("Incorrect number of EM jobs running(" + activeJobsCount + ") than expected(" + expectedJobsCount + "), remove existing and create new jobs as expected count");
                    this.createNewJobs();
                    gs.error("New EM processing jobs have been created from the coordinator job: " + expectedJobsCount);
                    this.saveActiveJobCount(expectedJobsCount);
                } else {
                    gs.info("Job count in the database(" + jobsInDB + ") and actual job count(" + activeJobsCount + ") are not same, syncing the database with correct count (" + expectedJobsCount + ")");
                    // Save the active jobs in the database
                    this.saveActiveJobCount(expectedJobsCount);
                }
                return;
            }
            gs.sleep(1000);
        }
    },

    type: 'EvtMgmtProcessCoordinator'
};
