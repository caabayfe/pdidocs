if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    deleteEnrollmentSnapshot();
}

function deleteEnrollmentSnapshot() {
    var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();
    var processId = event.parm1;
    var verificationId = event.parm2;

    try {
        if (pwdEnrollSnapshotUtil.isAutoEnrollVerification(verificationId) || !pwdEnrollSnapshotUtil.isActiveProcess(processId))
            return;

        var userIds = pwdEnrollSnapshotUtil.getUsersByProcesses([processId]);
        for (var i = 0; i < userIds.length; i++) {
            pwdEnrollSnapshotUtil.deleteInValidEnrollmentSnapshotsByUserId(userIds[i]);
        }
    } catch (ex) {
        gs.error("[Script action: Delete enrollment snaps for a proc-ver. processId- " + processId + "]. execution error - " + ex);
    }
}
