var SGTMemberRemovalJobHistoryDAO = Class.create();
SGTMemberRemovalJobHistoryDAO.prototype = {
    initialize: function() {
        this.GRP_MEMBER_REMOVAL_JOB_TABLE_NAME = 'sgt_grmember_removal_job_history';
        this.SCAN_SYS_ID = 'scan';
        this.STATUS = 'status';
        this.SCHEDULED_TIME = 'scheduled_time';
        this.COMPLETED_TIME = 'completed_time';
        this.JOB_STATUS = {
            IN_PROGRESS: 'in_progress',
            SCHEDULED: 'scheduled',
            COMPLETED: 'completed',
            ERROR: 'error'
        };
        this.SYS_ID = 'sys_id';
    },

    updateRemovalJobStatus: function(jobID, scanID, status) {
        var removalJobGR = new GlideRecord(this.GRP_MEMBER_REMOVAL_JOB_TABLE_NAME);
        removalJobGR.addQuery(this.SYS_ID, jobID);
        removalJobGR.addQuery(this.SCAN_SYS_ID, scanID);
        removalJobGR.query();
        if (removalJobGR.next()) {
            removalJobGR.setValue(this.STATUS, status);
            if (status == this.JOB_STATUS.COMPLETED) {
                removalJobGR.setValue(this.COMPLETED_TIME, new GlideDateTime());
            }
            removalJobGR.update();
        }
    },

    save: function(scanID, scheduledTime) {
        var removalJobGR = new GlideRecord(this.GRP_MEMBER_REMOVAL_JOB_TABLE_NAME);
        removalJobGR.initialize();
        removalJobGR.setValue(this.SCAN_SYS_ID, scanID);
        removalJobGR.setValue(this.SCHEDULED_TIME, scheduledTime);
        removalJobGR.setValue(this.STATUS, this.JOB_STATUS.SCHEDULED);
        return removalJobGR.insert();
    },

    isAnyJobScheduledOrRunning: function() {
        var removalJobGR = new GlideRecord(this.GRP_MEMBER_REMOVAL_JOB_TABLE_NAME);
        removalJobGR.addQuery(this.STATUS, this.JOB_STATUS.SCHEDULED)
            .addOrCondition(this.STATUS, this.JOB_STATUS.IN_PROGRESS);
        removalJobGR.query();
        return removalJobGR.next();
    },

    type: 'SGTMemberRemovalJobHistoryDAO'
};
