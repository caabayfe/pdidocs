if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    var processSysId = event.parm1;
    try {
        new global.PwdExpirationUtils().deleteAllExpirationRecordsForAProcess("");
        new global.PwdExpirationScheduleJobHelper().deleteExpirationScheduledJobs(processSysId);
    } catch (e) {
        gs.error("[Script action: Delete Expiration records for a process execution error - " + e.getMessage());
    }
}
