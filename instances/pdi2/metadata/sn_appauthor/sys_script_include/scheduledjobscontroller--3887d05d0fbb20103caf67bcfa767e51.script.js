var ScheduledJobsController = Class.create();
ScheduledJobsController.prototype = {
    initialize: function() {
        this.DEFAULT_SCHEDULED_JOBS_CONFIG = {
            "updateChecker": {
                isEnabled: true,
                startTime: 0,
                endTime: 36000
            }, "configChecker": {
                isEnabled: true,
                startTime: 0,
                endTime: 600
            }
        }
    },

    getConfig: function(jobName) {
        var defaultConfig = this.DEFAULT_SCHEDULED_JOBS_CONFIG[jobName];
        var scheduledJobsConfig = JSON.parse(gs.getProperty("sn_appclient.scheduled_jobs_config", {}));
        if(scheduledJobsConfig.hasOwnProperty(jobName)) {
            var jobConfig = scheduledJobsConfig[jobName];
            defaultConfig.isEnabled = jobConfig.hasOwnProperty("isEnabled") ? jobConfig.isEnabled : defaultConfig.isEnabled;
            if(defaultConfig.isEnabled) {
                defaultConfig.startTime = jobConfig.hasOwnProperty("startTime") ? jobConfig.startTime : defaultConfig.startTime;
                defaultConfig.endTime = jobConfig.hasOwnProperty("endTime") ? jobConfig.endTime : defaultConfig.endTime;
            }
        }
        return defaultConfig;
    },

    type: 'ScheduledJobsController'
};
