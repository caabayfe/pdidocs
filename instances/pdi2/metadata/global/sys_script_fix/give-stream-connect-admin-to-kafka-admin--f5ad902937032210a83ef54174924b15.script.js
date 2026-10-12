(function () {
    var KAFKA_ADMIN_ROLE = 'kafka_admin';
    var STREAM_CONNECT_ADMIN_ROLE = 'stream_connect_admin';

    var kafkaRoleId = getRoleId(KAFKA_ADMIN_ROLE);    
    var streamConnectRoleId = getRoleId(STREAM_CONNECT_ADMIN_ROLE);    

    if (!kafkaRoleId || !streamConnectRoleId) {
        gs.error('[Fix Script] Required roles not found');
        return;
    }

    var usersUpdated = grantRoleToUsers(kafkaRoleId, streamConnectRoleId);    
    gs.info('[Fix Script] Granted ' + STREAM_CONNECT_ADMIN_ROLE + ' to ' + usersUpdated + ' user(s) with ' + KAFKA_ADMIN_ROLE);

    function getRoleId(roleName) {
        var roleGR = new GlideRecord('sys_user_role');
        roleGR.addQuery('name', roleName);
        roleGR.query();
        if (roleGR.next()) {
            return roleGR.sys_id.toString();
        } else {
            gs.error('[Fix Script] Role not found: ' + roleName);
            return null;
        }
    }

    function grantRoleToUsers(kafkaRoleId, streamConnectRoleId) {
        var userRoleGR = new GlideRecord('sys_user_has_role');
        userRoleGR.addQuery('role', kafkaRoleId);
        userRoleGR.query();

        var userCount = 0;
        while (userRoleGR.next()) {
            var userId = userRoleGR.user;
            if (!hasRole(userId, streamConnectRoleId)) {
                assignRole(userId, streamConnectRoleId);
                userCount++;
            }
        }
        return userCount;
    }

    function hasRole(userId, roleId) {
        var userRoleGR = new GlideRecord('sys_user_has_role');
        userRoleGR.addQuery('user', userId);
        userRoleGR.addQuery('role', roleId);
        userRoleGR.query();
        return userRoleGR.hasNext();
    }

    function assignRole(userId, roleId) {
        var newRole = new GlideRecord('sys_user_has_role');
        newRole.initialize();
        newRole.user = userId;
        newRole.role = roleId;
        newRole.insert();
    }
})();
