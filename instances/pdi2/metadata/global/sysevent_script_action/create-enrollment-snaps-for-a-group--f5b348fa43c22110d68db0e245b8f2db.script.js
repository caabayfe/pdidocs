if (GlideProperties.getBoolean('pwd_reset.enable.enrollment_snapshot', true)) {
    var pwdExpirationUtils = new global.PwdExpirationUtils();
    var pwdEnrollSnapshotUtil = new global.PwdEnrollSnapshotUtil();
    createOrUpdateEnrollmentSnapshots();
}

function createOrUpdateEnrollmentSnapshots() {
    var groupSysId = event.parm1;
    var previousParentGroupId = event.parm2;

    try {
        var groupGr = new GlideRecord("sys_user_group");
        if (groupGr.get(groupSysId) && pwdEnrollSnapshotUtil.isActiveGroup(groupSysId)) {
            var parentGroupId = groupGr.getValue("parent");
            //Since its a before update event so we are making sure the update operation was succeded

            if (parentGroupId != previousParentGroupId) {
                //get all the users associated with this group & its sub groups
                var userGroupMemberGr = pwdExpirationUtils.getAllUsersForGroup([groupSysId]);

                //first delete enrollment snaps for the previous parent group
                deleteEnrollmentSnapshotForParent(userGroupMemberGr, previousParentGroupId);
                //create enrollment snaps for the current parent group
                createEnrollmentSnapshotForParent(userGroupMemberGr, parentGroupId);
            }
        }
    } catch (ex) {
        gs.error("[Script action: Create enrollment snaps for a group - " + groupSysId + "]. execution error - " + ex);
    }
}

function deleteEnrollmentSnapshotForParent(userGroupMemberGr, parentGroupId) {
    if (!parentGroupId)
        return;

    var arrayUtil = new ArrayUtil();
    var pwdVerificationManager = new SNC.PwdVerificationManager();

    //get all the processes associated with the current parent group
    var parentProcesses = pwdExpirationUtils.getProcessesAssociatedWithAGroup(parentGroupId);
    // get all verifications for parent processes
    var parentVerifications = pwdEnrollSnapshotUtil.getManualVerificationsAccociatedWithProcesses(parentProcesses);


    while (userGroupMemberGr.next()) {
        //Getting all the remaining entitled verification for that user (excluding the verification related to the group with sys_id as userGroupSysId)
        var currentVerifications = pwdVerificationManager.getVerificationIdsForUser(userGroupMemberGr.user);

        for (var index = 0; index < parentVerifications.length; index++) {
            //if the parentVerification is not in currentVerification then delete the record.
            if (!arrayUtil.contains(currentVerifications, parentVerifications[index])) {
                pwdEnrollSnapshotUtil.deleteEnrollmentSnapshotsByUserIdAndVerification(userGroupMemberGr.user, parentVerifications[index]);
            }
        }
    }
}

function createEnrollmentSnapshotForParent(userGroupMemberGr, parentGroupId) {
    if (!parentGroupId || !pwdEnrollSnapshotUtil.isActiveGroup(parentGroupId))
        return;

    //get all the processes associated with the current parent group
    var parentProcesses = pwdExpirationUtils.getProcessesAssociatedWithAGroup(parentGroupId);
    // get all verifications for parent processes
    var parentVerifications = pwdEnrollSnapshotUtil.getManualVerificationsAccociatedWithProcesses(parentProcesses);

    while (userGroupMemberGr.next()) {
        for (var index = 0; index < parentVerifications.length; index++) {
            // if there is no verification for userGroupMemberGr.user and parentVerifications pair, then create records in snapshot table
            pwdEnrollSnapshotUtil.createOrUpdateEnrollmentSnapshot(parentVerifications[index], userGroupMemberGr.user);
        }
    }
}
