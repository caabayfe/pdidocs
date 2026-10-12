if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    createEnrollmentSnapshot();
}

function createEnrollmentSnapshot() {
    var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();
    var procVerificationGr = new GlideRecord("pwd_map_proc_to_verification");
    if (procVerificationGr.get(event.parm1) && procVerificationGr.process.active && !procVerificationGr.verification.type.auto_enroll) {
        var processId = procVerificationGr.process;
        var verificationId = procVerificationGr.verification;

        try {
            var userIds = pwdEnrollSnapshotUtil.getUsersByProcesses([processId]);
            for (var i = 0; i < userIds.length; i++) {
                pwdEnrollSnapshotUtil.createOrUpdateEnrollmentSnapshot(verificationId, userIds[i]);
            }
        } catch (ex) {
            gs.error("[Script action: Create Enrollment snaps for a proc-ver processId- " + processId + ",verificationId- " + verificationId + " ]. execution error - " + ex);
        }
    }
}
