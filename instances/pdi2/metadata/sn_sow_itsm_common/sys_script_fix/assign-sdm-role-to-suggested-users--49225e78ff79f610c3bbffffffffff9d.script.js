var sdmCandidateManagersSet = {}; 
var sdaGroupsSet = {}; 
(function findIncludedManagers() {
    //Case 1: Users who are managers of an assignment group that have the SDA role (sn_service_desk_agent) assigned
    var groupRoleGR = new GlideRecord("sys_group_has_role");
    groupRoleGR.addQuery("role.name=sn_service_desk_agent");
    groupRoleGR.addNotNullQuery("group");
    groupRoleGR.query();
    while (groupRoleGR.next()) {
        var groupId = groupRoleGR.getValue("group");
        sdaGroupsSet[groupId] = true;
    }

    //Case 3: Users who are managers of an assignment group specified in the Service Desk Group Inclusion user criteria record
    var SERVICE_DESK_GROUP_INCLUSION_SYS_ID = "14a02db5c7c13010d7e818b1c7c2601c";
    var userCriteriaGR = new GlideRecord("user_criteria");
    userCriteriaGR.addQuery("sys_id", SERVICE_DESK_GROUP_INCLUSION_SYS_ID);
    userCriteriaGR.addNotNullQuery("group");
    userCriteriaGR.addActiveQuery();
    userCriteriaGR.query();
    while (userCriteriaGR.next()) {
        var groupId = userCriteriaGR.getValue("group");
        groupId = groupId.toString();
        sdaGroupsSet[groupId] = true;
    }

    //Query group managers for case 1 and case 3
    var sdaGroupIds = Object.keys(sdaGroupsSet);
    if (sdaGroupIds.length > 0) {
        var groupGR = new GlideRecord("sys_user_group");
        groupGR.addQuery("sys_id", "IN", sdaGroupIds.join(","));
        groupGR.addNotNullQuery("manager");
        groupGR.addActiveQuery();
        groupGR.query();
        while (groupGR.next()) {
            sdmCandidateManagersSet[groupGR.manager.toString()] = true;
        }
    }

    //Case 2: Users who are managers of users that either have the SDA role assigned directly to them or are part of a group that has the SDA role assigned
    //Case 4: Users who are managers of users that are in an assignment group specified in the Service Desk Group Inclusion user criteria record
    var sdaUsersSet = {}; // All users with SDA role or in SDA groups

    if (sdaGroupIds.length > 0) {
        var groupMemberGR = new GlideRecord("sys_user_grmember");
        groupMemberGR.addQuery("group", "IN", sdaGroupIds.join(","));
        groupMemberGR.addNotNullQuery("user");
        groupMemberGR.query();
        while (groupMemberGR.next()) {
            var userId = groupMemberGR.getValue("user");
            sdaUsersSet[userId] = true;
        }
    }

    //Add users with SDA role directly assigned (for case 2)
    var userRoleGR = new GlideRecord("sys_user_has_role");
    userRoleGR.addQuery("role.name=sn_service_desk_agent");
    userRoleGR.addNotNullQuery("user");
    userRoleGR.query();
    while (userRoleGR.next()) {
        var userId = userRoleGR.getValue("user");
        sdaUsersSet[userId] = true;
    }

    //Get managers of all SDA users (case 2 and case 4)
    var sdaUserIds = Object.keys(sdaUsersSet);
    if (sdaUserIds.length > 0) {
        var userGR = new GlideRecord("sys_user");
        userGR.addQuery("sys_id", "IN", sdaUserIds.join(","));
        userGR.addNotNullQuery("manager");
        userGR.addActiveQuery();
        userGR.query();
        while (userGR.next()) {
            var managerId = userGR.getValue("manager");
            sdmCandidateManagersSet[managerId] = true;
        }
    }
})();
(function assignSDMRoleToManagers() {
    // Get the Service Desk Manager role
    var sdmRoleGR = new GlideRecord("sys_user_role");
    sdmRoleGR.addQuery("name", "sn_sow_itsm_common.sn_service_desk_manager");
    sdmRoleGR.query();

    if (!sdmRoleGR.next()) {
        gs.error("Service Desk Manager role not found: sn_sow_itsm_common.sn_service_desk_manager");
        return;
    }
    
    var sdmRoleSysId = sdmRoleGR.getUniqueValue();
    var sdmCandidateIds = Object.keys(sdmCandidateManagersSet);
    
    if (sdmCandidateIds.length === 0) {
        gs.info("No manager users found to assign the Service Desk Manager role.");
        return;
    }
    
    // Check all candidate users at once to find who already has the SDM role
    var usersAlreadyWithSDMRoleSet = {};
    var existingRoleGR = new GlideRecord("sys_user_has_role");
    existingRoleGR.addQuery("user", "IN", sdmCandidateIds.join(","));
    existingRoleGR.addQuery("role", sdmRoleSysId);
    existingRoleGR.query();
    while (existingRoleGR.next()) {
        var userIdWithRole = existingRoleGR.getValue("user");
        usersAlreadyWithSDMRoleSet[userIdWithRole] = true;
    }
    
    // Assign SDM role only to users who don't already have it
    sdmCandidateIds.forEach(function(userId) {
        if (!usersAlreadyWithSDMRoleSet[userId]) {
            var newUserRoleGR = new GlideRecord("sys_user_has_role");
            newUserRoleGR.initialize();
            newUserRoleGR.user = userId;
            newUserRoleGR.role = sdmRoleSysId;
            var insertResult = newUserRoleGR.insert();

            if (insertResult) {
                gs.info("Successfully assigned Service Desk Manager role to user: " + userId);
            } else {
                gs.error("Failed to assign Service Desk Manager role to user: " + userId);
            }
        }
    });
})();
