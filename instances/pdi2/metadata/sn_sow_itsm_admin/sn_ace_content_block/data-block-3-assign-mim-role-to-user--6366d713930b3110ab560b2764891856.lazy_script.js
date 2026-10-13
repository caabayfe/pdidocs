(function(context, pageParams, blockcontext) {
    // return some_output
    var roleId = "8b88f99687480300b4ae6c5837cb0b08"; //major_incident_manager role
    var userIds = blockcontext.selectedRecords_UsersList.split(",");
    for (var i = 0; i < userIds.length; i++) {
        var userId = userIds[i];
        var userRoleGR = new GlideRecord('sys_user_has_role');
        userRoleGR.addQuery('user', userId);
        userRoleGR.addQuery('role', roleId);
        userRoleGR.query();

        if (!userRoleGR.next()) {
            userRoleGR.initialize();
            userRoleGR.user = userId;
            userRoleGR.role = roleId;
            userRoleGR.insert();
        }
    }

    return {
        showAlert: "true"
    };
})(context, pageParams, blockcontext);
