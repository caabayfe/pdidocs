var CollabTaskService = (function() {
    return {
        /*
        	Generates collaboration task record for the passed user or group data
        */
        inviteCollaborators: function(usersIds, groupsIds, appId, descriptorId, feature) {
            var statusCodes = CollabTaskConstants.statusCodes;

            var appManagementData = AppManagementDataUtil.getCurrentUserData(appId);

            if (appManagementData.canUserManageCollaborators || appManagementData.canUserInviteCollaborators) {
                // for each of the collaborator create collaboration task
                var userInsertResponse = [];

                (usersIds || []).forEach(function(userId) {
                    // genrate collaboration task record for user by sending the second param as false into the util
                    var insertResponse = CollabTaskUtils.generateCollaborationTaskRecord(userId, false, appId, descriptorId, true, feature);

                    userInsertResponse.push(insertResponse);
                });

                var groupInsertResponse = [];

                (groupsIds || []).forEach(function(groupId) {
                    // genrate collaboration task record for group by sending the second param as true into the util
                    var insertResponse = CollabTaskUtils.generateCollaborationTaskRecord(groupId, true, appId, descriptorId, true, feature);

                    groupInsertResponse.push(insertResponse);
                });

                return {
                    body: {
                        descriptorId: descriptorId,
                        appId: appId,
                        users: userInsertResponse,
                        groups: groupInsertResponse
                    },
                    status: statusCodes.SUCCESS
                };
            } else {
                throw new sn_ws_err.ServiceError()
                    .setStatus(statusCodes.FORBIDDEN)
                    .setMessage(gs.getMessage('User does not have permission to invite collaborators to app with Id {0}.', appId));
            }
        },

        getPendingCollaborators: function(appId) {
            var statusCodes = CollabTaskConstants.statusCodes;

            if (!UserDelegatedDevPermissions.canUserReadApp(appId)) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(statusCodes.FORBIDDEN)
                    .setMessage(gs.getMessage('403 Forbidden: User does not have access to app with id {0}.', appId));
            }

            var appManagementData = AppManagementDataUtil.getCurrentUserData(appId);

            if (appManagementData.readOnlyMode) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(statusCodes.FORBIDDEN)
                    .setMessage(gs.getMessage('403 Forbidden: User does not have permission to read pending collaboration tasks for the app with id {0}.', appId));
            }

            var recordState = CollabTaskConstants.collabTaskStates;
            var collabTasksInScope = CollabTaskUtils.getCollaborationRequestsInScope(appId, recordState.NEW);

            return {
                body: {
                    appId: appId,
                    collabTasks: collabTasksInScope
                },
                status: statusCodes.SUCCESS
            };
        }
    };
})();
