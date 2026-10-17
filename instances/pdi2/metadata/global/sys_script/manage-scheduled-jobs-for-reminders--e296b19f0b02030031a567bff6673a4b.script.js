(function executeRule(current, previous /*null when async*/ ) {
    if (current.operation() == "insert" || current.operation() == "update") {
        new pwdEnrollmentReminder().createOrUpdateScheduleJob(current);
        new PwdExpirationScheduleJobHelper().manageExpirationNotificationScheduleJob(current);
        new PwdExpirationScheduleJobHelper().manageExpirationDataScheduleJobForAProcess(current);
    }
    if (current.operation() == "delete") {
        new pwdEnrollmentReminder().deleteScheduledJob(current);
        new PwdExpirationScheduleJobHelper().deleteExpirationScheduledJobs(current.sys_id);
    }
})(current, previous);
