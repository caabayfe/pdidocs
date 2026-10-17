var C_JOB_NAME = 'Asset - Delete Asset Job Logs';
var jobSysId = 'dff063650f401010967863cda8767efd';
var assetUtils = new global.AssetUtils();

function deleteAssetJobLogs() {
    var jobLog = new global.AssetJobLogUtil();
    jobLog.startJobLog(C_JOB_NAME);
    if (assetUtils.isJobRunning(jobSysId)) {
        jobLog.stopJobLog(jobLog.FAILED_STATUS, C_JOB_NAME + ' job is already running');
    } else {
        try {
            var date = new global.AssetJobLogUtil().deleteJobLogs();
            jobLog.stopJobLog(jobLog.COMPLETED_STATUS, 'Asset Job Logs deleted before ' + date);
        } catch (error) {
            jobLog.stopJobLog(jobLog.FAILED_STATUS, error.message);
        }
    }
}

deleteAssetJobLogs();
