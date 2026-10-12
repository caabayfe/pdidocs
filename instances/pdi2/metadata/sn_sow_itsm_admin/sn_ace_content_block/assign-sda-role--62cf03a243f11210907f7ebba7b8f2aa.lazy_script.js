(function(context, pageParams, blockcontext) {
    var SN_SERVICE_DESK_AGENT_ROLE = "42248b8287bb02100645ddbabbbb3532";

    for (var i = 0; i < blockcontext.usersSelected.length; i++) {
        var userRoleGR = new GlideRecord("sys_user_has_role");
        userRoleGR.initialize();
        userRoleGR.setValue("user", blockcontext.usersSelected[i]);
        userRoleGR.setValue("role", SN_SERVICE_DESK_AGENT_ROLE);
        userRoleGR.insert();
    }


    for (i = 0; i < blockcontext.groupsSelected.length; i++) {
        var groupRoleGR = new GlideRecord("sys_group_has_role");
        groupRoleGR.initialize();
        groupRoleGR.setValue("group", blockcontext.groupsSelected[i]);
        groupRoleGR.setValue("role", SN_SERVICE_DESK_AGENT_ROLE);
        groupRoleGR.insert();
    }

    return {
        usersSelected: [],
        groupsSelected: []
    };

})(context, pageParams, blockcontext);
