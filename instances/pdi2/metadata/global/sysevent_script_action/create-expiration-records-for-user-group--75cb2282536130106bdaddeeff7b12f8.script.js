if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    createExpirationRecords();
}

function createExpirationRecords() {
    var userGroupGr = new GlideRecord("sys_user_grmember");
    userGroupGr.get(event.parm1);

    var user = userGroupGr.user;
    var group = userGroupGr.group;

    var processes = new global.PwdExpirationUtils().getProcessesAssociatedWithAGroup(group);

    for (var key in processes) {
        createOrUpdateExpirationRecords(key, user, group);
    }
}

function createOrUpdateExpirationRecords(processId, user, group) {
    var processGr = new GlideRecord("pwd_process");
    processGr.addQuery("sys_id", processId);
    processGr.addQuery("send_expiration_reminder", true);
    processGr.addActiveQuery();
    processGr.query();

    if (processGr.next()) {
        try {
            new global.PwdExpirationUtils().updatePasswordExpirationDetails(user, processId);
        } catch (ex) {
            gs.error("[Script action: Create Expiration records for user_id " + user + " and group_id " + group + "] execution error - " + ex);
        }
    }
}
