if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    createEnrollmentSnapshot();
}

function createEnrollmentSnapshot() {
    var userSysId = event.parm1;
    var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();

    try {
        if (!pwdEnrollSnapshotUtil.isActiveUser(userSysId)) {
            return;
        }
        pwdEnrollSnapshotUtil.createEnrollmentSnapshot(userSysId);
    } catch (ex) {
        gs.error("[Script action: Create enrollment snaps for a user with sys_id : " + userSysId + "]. execution error - " + ex);
    }
}
