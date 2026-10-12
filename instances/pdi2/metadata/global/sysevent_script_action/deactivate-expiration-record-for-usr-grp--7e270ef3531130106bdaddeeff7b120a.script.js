if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    deactivateExpirationRecords();
}

function deactivateExpirationRecords() {
    var userSysId = event.parm1;
    var userGroupSysId = event.parm2;

    try {
        //Getting all the remaining entitled processes for that user (excluding the process related to the group with sys_id as userGroupSysId)
        var userEntitledProcesses = new PasswordResetScopedUtil().getProcessIdsByUserId(userSysId).toString();
        var gr = new GlideRecord("pwd_expiration");
        gr.addQuery("user", userSysId);
        //Don't de-activate the password expiration record for the user-process pair if the user still associated with that process via another group
        gr.addQuery("pwd_process", "NOT IN", userEntitledProcesses);

        gr.setValue("active", false);
        gr.updateMultiple();
    } catch (ex) {
        gs.error("[Script action: Delete Expiration records for user_id " + userSysId + " and group_id " + userGroupSysId + "] execution error - " + ex);
    }
}
