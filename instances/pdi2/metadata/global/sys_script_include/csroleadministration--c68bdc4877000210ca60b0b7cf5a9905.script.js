var CSRoleAdministration = Class.create();
CSRoleAdministration.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    //Fetch and return a list of users (sys_id and name) who are admins and security_admins.
    getAvailableUsers: function() {
        var availableUsers = []; //Add the available users to select from

        var availableUsersGr = new GlideRecord("sys_user_has_role");
        var innerJoin = availableUsersGr.addJoinQuery("sys_user_has_role", "user", "user");
        availableUsersGr.addQuery("role.name", "admin").addOrCondition("role.name", "sn_cse.codesigning_admin");
        innerJoin.addCondition("role.name", "security_admin").addOrCondition("role.name", "sn_cse.codesigning_admin");
        availableUsersGr.addNotNullQuery("user.name");
        availableUsersGr.query();

        var visitedUserSysIds = [];
        while (availableUsersGr.next() && availableUsersGr.canRead()) {
            var availableItem = {};
            var userSysId = String(availableUsersGr.user.sys_id);
            availableItem.sys_id = userSysId;
            availableItem.name = String(availableUsersGr.user.name);
            if (visitedUserSysIds.indexOf(userSysId) === -1) {
                visitedUserSysIds.push(userSysId);
                availableUsers.push(availableItem);
            }
        }
        return JSON.stringify(availableUsers);
    },

    // Fetch and return a list of codesigning_admin role user sysIds
    getCSAdminUserSysIds: function() {
        var csAdminUserSysIds = [];
        var csAdminUsers = new GlideRecord("sys_user_has_role");
        csAdminUsers.addQuery("role.name", "sn_cse.codesigning_admin");
        csAdminUsers.query();

        while (csAdminUsers.next() && csAdminUsers.canRead()) {
            var userSysId = String(csAdminUsers.user.sys_id);
            if (csAdminUserSysIds.indexOf(userSysId) === -1)
                csAdminUserSysIds.push(userSysId);
        }
        return JSON.stringify(csAdminUserSysIds);
    },

    // Call backend logic to process the user sysIds for codesigning_admin role assignment
    assignCSAdminRole: function() {
        var userSysIds = this.getParameter('sysparm_user_sysIds');
        var administrationResult = new SNC.CSRoleAssignmentInterface().persistCSAdminRoleChgs(userSysIds);
        if (!administrationResult)
            gs.addErrorMessage(gs.getMessage("Error occurred on attempting to persist 'Code Signing' admin role changes. Please see logs for more information"));
        else
            gs.addInfoMessage(gs.getMessage("Successfully persisted 'Code Signing' admin role changes. User(s) with role changes have to logout and log back in to see the changes in effect."));
    },

    type: 'CSRoleAdministration'
});
