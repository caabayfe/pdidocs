var AppManagementDataUtil = (function() {
    return {
        getCurrentUserData: function(appId) {
            var permissionSetIds = CollabReqConstants.permissionSetIds;
            var descriptorIds = CollabReqConstants.descriptorIds;
            var INVITE_COLLABORATORS_PERM_SET_ID = permissionSetIds.INVITE_COLLABORATORS_PERM_SET_ID;
            var MANAGE_COLLABORATORS_PERM_SET_ID = permissionSetIds.MANAGE_COLLABORATORS_PERM_SET_ID;

            var EDITOR_DESCRIPTOR_ID = descriptorIds.EDITOR_DESCRIPTOR_ID;

            var permissions;

            if (!UserDelegatedDevPermissions.isScopeValid(appId)) {
                UserDelegatedDevPermissions.throwAppNotFound(appId);
            }

            var isUserAdmin = gs.hasRole('sn_collab_request.collaboration_request_admin');

            if (isUserAdmin) {
                permissions = {
                    canUserManageCollaborators: true,
                    canUserInviteCollaborators: true,
                    canUserModifyAllDesciptors: true,
                    inviteDescriptorsFilter: [],
                    readOnlyMode: false
                };
            } else {
                var permissionsGranted = UserDelegatedDevPermissions.getPermissionSetsGrantedToUserFromScope(appId);
                // if empty, then no permission sets are granted
                var grantedPermSetNameAndIds = UserDelegatedDevPermissions.getPermSetNamesAndIdsFromObj(permissionsGranted);
                var canUserManageCollaborators = !!grantedPermSetNameAndIds[MANAGE_COLLABORATORS_PERM_SET_ID];
                var canUserInviteCollaborators = !!grantedPermSetNameAndIds[INVITE_COLLABORATORS_PERM_SET_ID];
                var canUserOnlyInviteCollaborators = canUserInviteCollaborators && !canUserManageCollaborators;
                var inviteDescriptorsFilter = canUserOnlyInviteCollaborators ? [EDITOR_DESCRIPTOR_ID] : [];

                permissions = {
                    canUserManageCollaborators: canUserManageCollaborators,
                    canUserInviteCollaborators: canUserInviteCollaborators,
                    canUserModifyAllDesciptors: false,
                    readOnlyMode: !canUserManageCollaborators && !canUserInviteCollaborators,
                    inviteDescriptorsFilter: inviteDescriptorsFilter
                };
            }

            return permissions;
        }
    };
})();
