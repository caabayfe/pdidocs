(function(context, pageParams, blockcontext) {
    var SN_SERVICE_DESK_MANAGER_ROLE = "c696ba7fff29321023c3ffffffffffd5";

    for (var i = 0; i < blockcontext.usersSelected.length; i++) {
        var userRoleGR = new GlideRecord("sys_user_has_role"); 
        userRoleGR.initialize();
        userRoleGR.setValue("user", blockcontext.usersSelected[i]);
        userRoleGR.setValue("role", SN_SERVICE_DESK_MANAGER_ROLE);
        userRoleGR.insert();
    }


    for (i = 0; i < blockcontext.groupsSelected.length; i++) {
        var groupRoleGR = new GlideRecord("sys_group_has_role");
        groupRoleGR.initialize();
        groupRoleGR.setValue("group", blockcontext.groupsSelected[i]);
        groupRoleGR.setValue("role", SN_SERVICE_DESK_MANAGER_ROLE);
        groupRoleGR.insert();
    }

    return {
        usersSelected: [],
        groupsSelected: []
    };

})(context, pageParams, blockcontext);
