if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    createEnrollmentSnapshot();
}

function createEnrollmentSnapshot() {
    var groupProcessGr = new GlideRecord("pwd_map_proc_to_group");
    if (groupProcessGr.get(event.parm1) && groupProcessGr.process.active && groupProcessGr.user_group.active) {
        var userGroup = groupProcessGr.user_group;
        var process = groupProcessGr.process;
        var pwdEnrollSnapshotUtil = new PwdEnrollSnapshotUtil();

        try {
            var userGroupMemberGr = new PwdExpirationUtils().getAllUsersForGroup([userGroup]);
            while (userGroupMemberGr.next()) {
                pwdEnrollSnapshotUtil.createEnrollmentSnapshot(userGroupMemberGr.user);
            }
        } catch (ex) {
            gs.error("[Script action: Create Enrollment snapshot for proc-group for process_id " + process + " and group_id " + userGroup + "]. execution error - " + ex);
        }
    }
}
