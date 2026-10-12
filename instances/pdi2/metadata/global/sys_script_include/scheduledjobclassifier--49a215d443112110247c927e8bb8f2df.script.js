var ScheduledJobClassifier = Class.create();
ScheduledJobClassifier.prototype = {
    initialize: function() {
        this.SCRIPT_NAME = 'ScheduledJobClassifier';
        this.fDebug = false;
        this.CLASSIFICATION_SCRIPT = "var mutex = new Mutex('" + this.SCRIPT_NAME + "'); \n if (mutex.get()) {\n \t new ScheduledJobClassifier().classifyAllJobs(); \n \t mutex.release(); \n }";
    },

    debug: function(msg) {
        if (this.fDebug)
            gs.debug(this.SCRIPT_NAME + ': ' + msg);
    },

    createOrUpdateJobToClassifyJobs: function(when, showMessage) {
        // We know we want to schedule the reclassification job, just not when
        var mutex = new Mutex(this.SCRIPT_NAME);
        mutex.setMaxSpins(1);
		var shouldRelease = true;
        if (!mutex.get()) {
            when.add(5 * 60 * 1000);
			shouldRelease = false; 
		}

        var gr = GlideRecord('sys_trigger');
        gr.addQuery('name', 'GlideSchedulerClassifyJobs');
        gr.addQuery('state', 0);
        gr.query();
        if (gr.next()) {
            gr.setValue('next_action', when);
            gr.update();
        } else {
            gr.setValue('name', 'GlideSchedulerClassifyJobs');
            gr.setValue('trigger_type', 0); // run once
            gr.setValue('script', this.CLASSIFICATION_SCRIPT);
            gr.setValue('next_action', when);
            gr.insert();
        }
        if (showMessage) {
            var sys_id = gr.getUniqueValue();
            gs.addInfoMessage(gs.getMessage("Scheduled a {0}background job at {1}{2} to re-classify jobs to reflect these new settings.",
                ['<a href="sys_trigger.do?sys_id=' + sys_id + '">', when.getDisplayValue(), '</a>']));
        }
        if (shouldRelease) 
			mutex.release();
        return gr;
    },

    classifyAllJobs: function() {
        var gr = new GlideRecord('sys_trigger');
        gr.addQuery("trigger_type", ">", 0); // do not reclassify run_once jobs
        gr.query();
        this.debug('Checking ' + gr.getRowCount() + ' sys_trigger records for re-classification');

        var classifier = new SNC.ScheduledJobClassifier();
        while (gr.next()) {
            var newClassification = classifier.classify(gr);
            if (newClassification != gr.getValue('job_classification')) {
                this.debug('Re-classifying ' + gr.getValue('name') + ' from ' + gr.getValue('job_classification') + ' to ' + newClassification);
                gr.setValue("job_classification", newClassification);
                gr.update();
            }
        }
    },



    type: 'ScheduledJobClassifier'
};
