(function(context, pageParams, blockcontext) {
    var SN_SERVICE_DESK_AGENT_ROLE = "42248b8287bb02100645ddbabbbb3532";

    var userRoleGR = new GlideRecord("sys_user_has_role");
    userRoleGR.addQuery("role", SN_SERVICE_DESK_AGENT_ROLE);
    userRoleGR.addActiveQuery();
    userRoleGR.addQuery("user.active", true);
    userRoleGR.query();

    var users = new Set();
    while (userRoleGR.next()) {
        users.add(userRoleGR.getValue("user"));
    }
    var usersWithRoleCount = users.size;

    var groupRoleGR = new GlideRecord("sys_group_has_role");
    groupRoleGR.addQuery("role", SN_SERVICE_DESK_AGENT_ROLE);
    groupRoleGR.addActiveQuery();
    groupRoleGR.addQuery("group.active", true);
    groupRoleGR.query();

    var groups = new Set();
    while (groupRoleGR.next()) {
        groups.add(groupRoleGR.getValue("group"));
    }
    var groupsWithRoleCount = groups.size;

    var showFirstTimeUserScreen = usersWithRoleCount + groupsWithRoleCount === 0;
    var showUsersAndGroupsList = !showFirstTimeUserScreen;

    var sdaTabCount = usersWithRoleCount + groupsWithRoleCount;
    var sdaTabLabel = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "Service Desk Agents ({count})", {
        count: sdaTabCount.toString()
    });

    // Count all users
    var userGA = new GlideAggregate("sys_user");
    userGA.addQuery("active", true);
    userGA.addAggregate("COUNT");
    userGA.query();
    var totalUsers = userGA.next() ? parseInt(userGA.getAggregate("COUNT"), 10) : 0;

    // Count all groups
    var groupGA = new GlideAggregate("sys_user_group");
    groupGA.addQuery("active", true);
    groupGA.addAggregate("COUNT");
    groupGA.query();
    var totalGroups = groupGA.next() ? parseInt(groupGA.getAggregate("COUNT"), 10) : 0;

    // Calculate eligible users and groups
    var eligibleUsersCount = totalUsers - usersWithRoleCount;
    var eligibleGroupsCount = totalGroups - groupsWithRoleCount;
    var eligibleTabCount = eligibleUsersCount + eligibleGroupsCount;

    var eligibleTabLabel = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "All available groups and users ({count})", {
        count: eligibleTabCount.toString()
    });

    return {
        sdaGroups: "sys_idIN" + Array.from(groups).join(','),
        sdaUsers: "sys_idIN" + Array.from(users).join(','),
        showSDAGroups: groupsWithRoleCount > 0,
        showSDAUsers: usersWithRoleCount > 0,
        sdaTabLabel: sdaTabLabel,
        eligibleUsers: "sys_idNOT IN" + Array.from(users).join(','),
        eligibleGroups: "sys_idNOT IN" + Array.from(groups).join(','),
        eligibleTabLabel: eligibleTabLabel,
        showFirstTimeUserScreen: showFirstTimeUserScreen,
        showUsersAndGroupsList: showUsersAndGroupsList
    };

})(context, pageParams, blockcontext);
