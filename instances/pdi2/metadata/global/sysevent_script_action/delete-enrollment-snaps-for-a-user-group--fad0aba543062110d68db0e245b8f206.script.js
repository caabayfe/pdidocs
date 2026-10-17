if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    deleteEnrollmentSnapshot();
}

function deleteEnrollmentSnapshot() {
    var userSysId = event.parm1;
    var userGroupSysId = event.parm2;

    try {
        new PwdEnrollSnapshotUtil().deleteInValidEnrollmentSnapshotsByUserId(userSysId);
    } catch (ex) {
        gs.error("[Script action: Delete enrollment snaps for a user-group with user_id : " + userSysId + ", group_id : " + userGroupSysId + " ]. execution error - " + ex);
    }
}
