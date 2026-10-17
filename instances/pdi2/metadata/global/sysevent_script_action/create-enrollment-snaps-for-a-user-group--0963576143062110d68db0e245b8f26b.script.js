if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    createEnrollmentSnapshot();
}

function createEnrollmentSnapshot() {
    var userGroupGr = new GlideRecord("sys_user_grmember");

    if (userGroupGr.get(event.parm1) && userGroupGr.user.active && userGroupGr.group.active) {
        var user = userGroupGr.user;
        try {
            new PwdEnrollSnapshotUtil().createEnrollmentSnapshot(user);
        } catch (ex) {
            gs.error("[Script action: Create enrollment snaps for a user-group with sys_id : " + user + " ]. execution error - " + ex);
        }
    }
}
