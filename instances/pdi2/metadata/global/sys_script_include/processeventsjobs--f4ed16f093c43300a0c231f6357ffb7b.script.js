var ProcessEventsJobs = Class.create();
ProcessEventsJobs.prototype = {
    initialize: function() {
		this.USE_JOB_CLASSIFICATION_FOR_SYS_TRIGGER = GlideProperties.getBoolean('evt_mgmt.event_processing.use_job_classification_for_sys_trigger', true);
		this.RECURRING_NAME_PREFIX = 'Recurring.Event Management - process events';
		this.NAME_PREFIX = 'Event Management - process events';
		this.SYSTEM = 'ACTIVE NODES';
        this.MAX_NUMBER_OF_JOBS = 4;
	},

    createNewJobs: function(count, enableMultiNode, duration) {
        var message;

        if ((count <= 0) || count > this.MAX_NUMBER_OF_JOBS) {
            message = gs.getMessage("Number of defined jobs must be between 1 and {0}, inclusive. ", this.MAX_NUMBER_OF_JOBS);
            gs.log(this.type + ".createNewJobs: " + message);
            return {
				error: true,
				message: message,
			};
        }
        if (!duration || duration === '' || isNaN(duration) || duration <= 0 || duration > 24 * 3600) {
            duration = 5000;
            message = gs.getMessage("Event processing jobs are created. Duration: 5 sec");
            gs.log(message);
        } else {
            duration = duration * 1000;
            message = gs.getMessage("Event processing jobs are created. Duration is taken from the property 'Delay (seconds) before processing events that arrive to the DB': {0} sec", duration / 1000);
            gs.log(message);
        }

        /*****************************************************
         *  This value should be in sync with
         *  the calculated field (bucket) on em_event table. 
         *****************************************************/
        var BUCKET_COUNT = gs.getProperty('evt_mgmt.bucket_count', 100);


        //delete old ones
        var old = new GlideRecord('sys_trigger');
		if (this.USE_JOB_CLASSIFICATION_FOR_SYS_TRIGGER) {
            old.addQuery('job_classification', 'STARTSWITH', this.RECURRING_NAME_PREFIX);
        } else {
			old.addQuery('name', 'STARTSWITH', this.NAME_PREFIX);
		}
        old.query();
        old.deleteMultiple();


        //create new
        var bucketsPerJob = Math.ceil(BUCKET_COUNT / count);
        var lower = 0;
        var upper = bucketsPerJob;
        for (var i = 1; i <= count; i++) {
            var jobs = new GlideRecord('sys_trigger');
            jobs.initialize();
            if (count == 1) {
                jobs.name = this.NAME_PREFIX;
            } else {
                jobs.name = this.NAME_PREFIX + ' - ' + i;
            }
            if (enableMultiNode == 'true') //should support multi node - specify System as ACTIVE NODES
                jobs.system_id = this.SYSTEM;
            jobs.priority = 50;
            jobs.trigger_type = 1; //REPEAT
            jobs.state = 0; //READY
            var gdr = new GlideDuration(duration);
            jobs.repeat = gdr;
            jobs.upgrade_safe = true;

            jobs.script = 'var eventProcessor = new SNC.EvtMgmtEventProcessor(); eventProcessor.processWithLimit(' + lower + ',' + upper + ');';

            jobs.insert();
            lower = lower + bucketsPerJob;
            upper = upper + bucketsPerJob;
        }
    },

    type: 'ProcessEventsJobs'
};

ProcessEventsJobs.get = function() {
    return new ProcessEventsJobs();
};
