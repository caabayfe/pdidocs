if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    deleteEnrollmentSnapshot();
}

function deleteEnrollmentSnapshot() {
    var groupId = event.parm1;
    var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();
    var userGroupMemberGr = new PwdExpirationUtils().getAllUsersForGroup([groupId]);

    while (userGroupMemberGr.next()) {
        try {
            pwdEnrollSnapshotUtil.deleteInValidEnrollmentSnapshotsByUserId(userGroupMemberGr.user);
        } catch (ex) {
            gs.error("[Script action: Delete enrollment snaps for a process-group with user_id : " + userGroupMemberGr.user + " ]. execution error - " + ex);
        }
    }
}
