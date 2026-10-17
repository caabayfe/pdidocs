createOrDeleteEnrollmentSnapshot();

    function createOrDeleteEnrollmentSnapshot() {
        var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();
        var verificationTypeId = event.parm1;
        var isAutoEnroll = event.parm2 == 'true';

        try {
            //Get all verifications related to the verification type
            var verificationIds = pwdEnrollSnapshotUtil.getVerificationsByVerificationType(verificationTypeId);

            if (isAutoEnroll) {
                //Delete all verifications related to this verification type
                pwdEnrollSnapshotUtil.deleteEnrollmentSnapshotsByVerifications(verificationIds);
            } else {
                //Get all processes accociated with verifications
                var processIds = pwdEnrollSnapshotUtil.getProcessAccociatedWithVerifications(verificationIds);
                //Create enrollment shanpshots for all the valid users for processes
                pwdEnrollSnapshotUtil.createEnrollmentSnapshotsByProcesses(processIds);
            }
        } catch (ex) {
            gs.error("[Script action: Update enrollment snaps for auto enroll. verificationTypeId - " + verificationTypeId + "]. execution error - " + ex);
        }
    }
