if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    deactivateExpirationRecords();
}

function deactivateExpirationRecords() {
    var groupId = event.parm1;
    var userGroupMemberGr = new PwdExpirationUtils().getAllUsersForGroup([groupId]);

    while (userGroupMemberGr.next()) {
        //Getting all the remaining entitled processes for that user (excluding the process related to the group with sys_id as groupId)
        var userEntitledProcesses = new PasswordResetScopedUtil().getProcessIdsByUserId(userGroupMemberGr.user).toString();
        var gr = new GlideRecord("pwd_expiration");
        gr.addQuery("user", userGroupMemberGr.user);
        //Don't de-activate the password expiration record for the user-process pair if the user still associated with that process via another group
        gr.addQuery("pwd_process", "NOT IN", userEntitledProcesses);

        gr.setValue("active", false);
        gr.updateMultiple();
    }
}
