(function(context, pageParams, blockcontext) {
    // return some_output
    var userRole = new GlideRecord('sys_user_has_role');
    userRole.addQuery('role=8b88f99687480300b4ae6c5837cb0b08'); // major_incident_manager role
    userRole.query();
    var uniqueIds = [];
    while (userRole.next()) {
        var userId = userRole.user.user_name;
        uniqueIds.push(userId);
    }
    if (uniqueIds.length === 0) {
        return {
            showFirstTimeUser: true,
            showList: false
        };
    } else {
        return {
            miList: "user_nameIN" + uniqueIds,
            usersList: "user_nameNOT IN" + uniqueIds,
            showFirstTimeUser: false,
            showList: true
        };
    }


})(context, pageParams, blockcontext);
