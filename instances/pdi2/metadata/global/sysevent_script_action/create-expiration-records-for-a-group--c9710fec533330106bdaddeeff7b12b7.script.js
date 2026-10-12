if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    createOrUpdateExpirationRecords();
}

function createOrUpdateExpirationRecords() {
    var groupSysId = event.parm1;
    var previousParentGroupId = event.parm2;

    try {
        var groupGr = new GlideRecord("sys_user_group");
        groupGr.get(groupSysId);

        var parentGroupId = groupGr.getValue("parent");
        //Since its a before update event so we are making sure the update operation was succeded

        if (parentGroupId != previousParentGroupId) {
            //first de-activate all the expiration records for the previous parent process
            createOrUpdateExpirationRecordsForParent(groupSysId, previousParentGroupId, false);
            //create expiration records for the current parent process
            createOrUpdateExpirationRecordsForParent(groupSysId, parentGroupId, true);
        }
    } catch (ex) {
        gs.error("[Script action: Create Expiration records for a group - " + groupSysId + "] execution error - " + ex);
    }
}

function createOrUpdateExpirationRecordsForParent(groupSysId, parentGroupId, isCurrentParent) {
    if (!parentGroupId)
        return;
    var pwdExpirationUtils = new global.PwdExpirationUtils();
    //get all the processes associated with the current parent group
    var processes = pwdExpirationUtils.getProcessesAssociatedWithAGroup(parentGroupId);
    //get all the users associated with this group & its sub groups and create/update expiration record for each process-user pair
    var userGroupMemberGr = pwdExpirationUtils.getAllUsersForGroup([groupSysId]);

    if (isCurrentParent) {
        while (userGroupMemberGr.next()) {
            for (var processId in processes) {
                pwdExpirationUtils.updatePasswordExpirationDetails(userGroupMemberGr.user, processId);
            }
        }
    } else {
        while (userGroupMemberGr.next()) {
            //Getting all the remaining entitled processes for the user (excluding the processes related to the parent group)
            var userEntitledProcesses = new PasswordResetScopedUtil().getProcessIdsByUserId(userGroupMemberGr.user).toString();
            for (var processSysId in processes) {
                if (!userEntitledProcesses.includes(processSysId))
                    pwdExpirationUtils.deactivateExpirationRecordsForUserProcessPair(userGroupMemberGr.user, processSysId);
            }
        }
    }
}
