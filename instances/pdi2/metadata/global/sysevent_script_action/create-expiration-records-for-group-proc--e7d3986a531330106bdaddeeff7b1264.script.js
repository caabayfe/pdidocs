if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    createExpirationRecords();
}

function createExpirationRecords() {
    var pwdExpirationUtil = new global.PwdExpirationUtils();
    var groupProcessGr = new GlideRecord("pwd_map_proc_to_group");
    groupProcessGr.get(event.parm1);

    var userGroup = groupProcessGr.user_group;
    var process = groupProcessGr.process;

    if (process.active && process.send_expiration_reminder) {
        try {
            var userGroupMemberGr = pwdExpirationUtil.getAllUsersForGroup([userGroup]);

            while (userGroupMemberGr.next()) {
                pwdExpirationUtil.updatePasswordExpirationDetails(userGroupMemberGr.user, process);
            }
        } catch (ex) {
            gs.error("[Script action: Create Expiration records for group-proc for process_id " + process + " and group_id " + userGroup + "] execution error - " + ex);
        }
    }
}
