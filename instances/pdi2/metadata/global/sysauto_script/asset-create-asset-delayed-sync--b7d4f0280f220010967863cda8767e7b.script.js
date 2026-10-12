var C_JOB_NAME = 'Asset - Create asset delayed sync';
var jobSysId = 'b7d4f0280f220010967863cda8767e7b';
var assetUtils = new global.AssetUtils();

function generateAssets() {
    var jobLog = new global.AssetJobLogUtil();
    jobLog.startJobLog(C_JOB_NAME);
    if (assetUtils.isJobRunning(jobSysId)) {
        jobLog.stopJobLog(jobLog.FAILED_STATUS, C_JOB_NAME + ' job is already running');
    } else {
        try {
			var queueProcessor = new global.AssetQueueProcessor(jobLog);
			queueProcessor.process();
			jobLog.stopJobLog(jobLog.COMPLETED_STATUS, queueProcessor.generateComments());
        } catch (error) {
            jobLog.stopJobLog(jobLog.FAILED_STATUS, error.message);
        }
    }
}

generateAssets();
