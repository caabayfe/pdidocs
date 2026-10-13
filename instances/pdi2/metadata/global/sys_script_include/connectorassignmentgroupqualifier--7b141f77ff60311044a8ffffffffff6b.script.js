var ConnectorAssignmentGroupQualifier = Class.create();
ConnectorAssignmentGroupQualifier.prototype = {
    initialize: function() {},

    /**
     * Return a qualifier that enlists all sys_user_group records related to logged in user.
     */
    getAdvancedQualifier: function() {
        var currentUser = gs.getUser();
        var nonExistingGroupId = 'invalid_group_id';

        // Fetch admin roles
        var adminRoles = new ConnectorInstanceUtil().getAssignmentGroupAdminRoles().trim().split(',');

        // Check if user has any of the assignment group admin roles
        for (var i = 0; i < adminRoles.length; i++) {
            if (currentUser.hasRole(adminRoles[i])) {
                return ''; // Return an empty query to show all options
            }
        }

        // Get user groups that current user is the member of or is the manager of.
        var userGroups = new ConnectorInstanceUtil().getCurrentUserGroupsForMemberOrManager();

        if (userGroups.length > 0) {
            return 'sys_idIN' + userGroups.join(',');
        } else {
            return 'sys_idIN' + nonExistingGroupId; // Return query with non-existing group to show no options
        }
    },

    type: 'ConnectorAssignmentGroupQualifier'
};
