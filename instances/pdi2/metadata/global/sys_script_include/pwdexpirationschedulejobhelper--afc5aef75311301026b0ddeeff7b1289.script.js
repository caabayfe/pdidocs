var PwdExpirationScheduleJobHelper = Class.create();
PwdExpirationScheduleJobHelper.prototype = {
    EXPIRATION_REMINDER_SCHEDULED_JOB_PREFIX: "pwd_expiration_reminder_",
    SYNC_EXPIRATION_DATA_SCHEDULED_JOB_PREFIX: "Sync password expiration records for pwd_process_",
    DEACTIVATE_EXPIRATION_RECORDS_FOR_PROCESS_EVENT: 'pwd.expiration.deactivate_records',
    initialize: function() {
        this._isPasswordExpirationFeatureEnabled = GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false);
    },
    manageExpirationNotificationScheduleJob: function(processGr) {
        if (!this._isPasswordExpirationFeatureEnabled)
            return;
        var scheduleJobGr = this._findScheduleJob(this.EXPIRATION_REMINDER_SCHEDULED_JOB_PREFIX + processGr.getUniqueValue());
        if (!gs.nil(scheduleJobGr)) {
            this.updateExpirationNotificationScheduleJob(processGr, scheduleJobGr);
        } else if (processGr.send_expiration_reminder && processGr.active) {
            this._createExpirationNotificationScheduleJob(processGr);
        }
    },
    manageExpirationDataScheduleJobForAProcess: function(processGr) {
        if (!this._isPasswordExpirationFeatureEnabled)
            return;

        var processSysId = processGr.getUniqueValue();
        //Call an event to de-activate all the expiration records for a process if that process becomes inactive or the Send Expiration Reminder checkbox becomes inactive
        if (!processGr.send_expiration_reminder || !processGr.active) {
            gs.eventQueue(this.DEACTIVATE_EXPIRATION_RECORDS_FOR_PROCESS_EVENT, processGr, processSysId, null);
        }

        var startDate = this._getStartDate();
        var currentDate = new GlideDateTime();
        var jobName = this.SYNC_EXPIRATION_DATA_SCHEDULED_JOB_PREFIX + processSysId;
        var jobScript = "new global.PwdExpirationUtils().syncExpirationTableDataForProcessId(\"" + processSysId + "\");";

        /* create a new schedule job to create expiration records which will run once after one hour.
        If job already exists then check if that job is already executed. If yes, update the start time so that the same job will execute again after one hour else dont do anything*/
        try {
            var scheduleJobGr = this._findScheduleJob(jobName);
            if (!gs.nil(scheduleJobGr)) {
                scheduleJobGr.setValue("active", processGr.send_expiration_reminder && processGr.active);
                if (scheduleJobGr.getValue("run_start") < startDate && scheduleJobGr.getValue("run_start") < currentDate)
                    scheduleJobGr.setValue("run_start", startDate);
                scheduleJobGr.update();
            } else if (processGr.send_expiration_reminder && processGr.active) {
                scheduleJobGr = this._createRefreshExpirationDataScheduleJob(scheduleJobGr, jobName, jobScript, startDate);
            }
            startDate = scheduleJobGr.getDisplayValue("run_start");
            if (processGr.send_expiration_reminder && processGr.active)
            	gs.addInfoMessage(gs.getMessage("Sync password expiration data will be done at {0}", startDate));
        } catch (ex) {
            gs.error("[global.PwdExpirationScheduleJobHelper] manageExpirationDataScheduleJobForAProcess() for pwd_process_" + processSysId + " execution error - " + ex);
        }
    },
    _createRefreshExpirationDataScheduleJob: function(scheduleJobGr, jobName, jobScript, startDate) {
        if (gs.nil(scheduleJobGr))
            scheduleJobGr = new GlideRecord("sysauto_script");
        scheduleJobGr.setValue("name", jobName);
        scheduleJobGr.setValue("active", true);
        scheduleJobGr.setValue("conditional", true);
        scheduleJobGr.setValue("condition", "GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false);");
        scheduleJobGr.setValue("run_start", startDate);
        scheduleJobGr.setValue("run_type", "once");
        scheduleJobGr.setValue("time_zone", "floating");
        scheduleJobGr.setValue("entered_time", new GlideTime());
        scheduleJobGr.setValue("script", jobScript);
        scheduleJobGr.update();
        return scheduleJobGr;
    },
    //The start date would be after one hour.
    _getStartDate: function() {
        var startDate = new GlideDateTime();
        startDate.addSeconds(3600);
        return startDate;
    },
    _findScheduleJob: function(jobName) {
        var gr = new GlideRecord("sysauto_script");
        if (gr.get("name", jobName))
            return gr;
        return null;
    },

    _createExpirationNotificationScheduleJob: function(process) {
        var processId = process.getUniqueValue();

        var gr = new GlideRecord("sysauto_script");
        gr.setValue("name", this.EXPIRATION_REMINDER_SCHEDULED_JOB_PREFIX + processId);
        gr.setValue("active", true);
        gr.setValue("conditional", true);
        gr.setValue("condition", "GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false);");
        gr.setValue("script", this._getExpirationNotificationScheduleJobScript(processId));
        this._setCommonFields(gr, process);

        gr.insert();
    },

    _setCommonFields: function(scheduleJob, processGr) {
        scheduleJob.setValue("run_type", processGr.getValue("expiration_schedule_frequency"));
        if (processGr.getValue("expiration_schedule_frequency") == "daily") {
            scheduleJob.setValue("time_zone", processGr.getValue("expiration_run_time_zone"));
            scheduleJob.setValue("entered_time", processGr.getValue("expiration_run_time"));
            scheduleJob.setValue("run_time", processGr.getValue("expiration_run_time"));
        } else {
            var run_start = processGr.getValue("expiration_run_start");
            if (gs.nil(run_start))
                run_start = new GlideDateTime();
            scheduleJob.setValue("run_start", run_start);
            scheduleJob.setValue("run_period", processGr.getValue("expiration_run_period"));
        }
    },

    //update active/period/start of schedule job.
    updateExpirationNotificationScheduleJob: function(processGr, scheduleJob) {
        scheduleJob.setValue("active", processGr.send_expiration_reminder && processGr.active);

        this._setCommonFields(scheduleJob, processGr);

        scheduleJob.update();
    },

    deleteExpirationScheduledJobs: function(processId) {
        var expirationScheduleJobGr = this._findScheduleJob(this.EXPIRATION_REMINDER_SCHEDULED_JOB_PREFIX + processId);
        if (!gs.nil(expirationScheduleJobGr)) {
            expirationScheduleJobGr.deleteRecord();
        }
        var refreshExpirationDataScheduleJobGr = this._findScheduleJob(this.SYNC_EXPIRATION_DATA_SCHEDULED_JOB_PREFIX + processId);
        if (!gs.nil(refreshExpirationDataScheduleJobGr)) {
            refreshExpirationDataScheduleJobGr.deleteRecord();
        }
    },
    _getExpirationNotificationScheduleJobScript: function(processId) {
        return "new global.PwdExpirationUtils().sendPasswordExpirationReminderToUsers(\"" + processId + "\");";
    },
    type: 'PwdExpirationScheduleJobHelper'
};
