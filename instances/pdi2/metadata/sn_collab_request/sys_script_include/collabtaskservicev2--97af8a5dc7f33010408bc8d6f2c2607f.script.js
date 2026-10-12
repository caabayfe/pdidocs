var CollabTaskServiceV2 = (function() {
    return {
        /*
        	Generates collaboration task record for the passed user or group data 
        */
        inviteCollaborators: function(usersIds, groupsIds, appId, descriptorId, feature, sourceStudioName, optionalMessage) {
            var statusCodes = CollabTaskConstants.statusCodes;

            var appManagementData = AppManagementDataUtil.getCurrentUserData(appId);
            var validDescriptor = appManagementData.inviteDescriptorsFilter.length === 0 || appManagementData.inviteDescriptorsFilter.indexOf(descriptorId) > -1;

            //added another condition if feature is JOIN we are allowing the users to create join app request by them selves
            if (((appManagementData.canUserManageCollaborators || appManagementData.canUserInviteCollaborators) || feature === 'JOIN') && validDescriptor) {
                // for each of the collaborator create collaboration task
                try {
                    var collabControllerUtils = new CollabControllerUtils();
                } catch (e) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(404)
                        .setMessage(gs.getMessage("Valid controller is not found"))
                        .setDetail(e);
                }

                var collabRequestUtils = new CollabReqUtils();
                var redirectToController = !collabControllerUtils.isCurrentInstanceController() && collabControllerUtils.isControllerConfigured;
                var collabTaskRecords = [];
                var userInsertResponse = [];

                (usersIds || []).forEach(function(userId) {
                    if (redirectToController) {
                        // generate collaboration task record for user by sending the second param as false into the util
                        var userCollabTaskResponse = CollabTaskUtils.generateCollaborationTaskRecord(userId, false, appId, descriptorId, false, feature, sourceStudioName, optionalMessage);
                        var collabTaskObject = collabRequestUtils.getObjectFromGlideRecord(userCollabTaskResponse.collaborationTaskRecord);
                        collabTaskRecords.push(collabTaskObject);
                    } else {
                        var insertResponse = CollabTaskUtils.generateCollaborationTaskRecord(userId, false, appId, descriptorId, true, feature, sourceStudioName, optionalMessage);

                        userInsertResponse.push(insertResponse);
                    }
                });

                var groupInsertResponse = [];

                (groupsIds || []).forEach(function(groupId) {
                    if (redirectToController) {
                        // genrate collaboration task record for group by sending the second param as true into the util
                        var groupCollabTaskResponse = CollabTaskUtils.generateCollaborationTaskRecord(groupId, true, appId, descriptorId, false, feature, sourceStudioName);
                        var collabTaskObject = collabRequestUtils.getObjectFromGlideRecord(groupCollabTaskResponse.collaborationTaskRecord);
                        collabTaskRecords.push(collabTaskObject);
                    } else {
                        var insertResponse = CollabTaskUtils.generateCollaborationTaskRecord(groupId, true, appId, descriptorId, true, feature, sourceStudioName);

                        groupInsertResponse.push(insertResponse);
                    }
                });

                if (collabTaskRecords.length) {
                    try {
                        var controllerResult = CollabTaskUtils
                            .createCollaborationTaskRecordsInController(collabTaskRecords, collabControllerUtils.getControllerRecord());
                        userInsertResponse = controllerResult.users;
                        groupInsertResponse = controllerResult.groups;

                    } catch (e) {
                        throw new sn_ws_err.ServiceError()
                            .setStatus(500)
                            .setMessage(gs.getMessage("Something went wrong when creating collaboration requests in controller"))
                            .setDetail(e.message || gs.getMessage("Unknown error when posting task records to controller environment"));
                    }
                }

                return {
                    body: {
                        descriptorId: descriptorId,
                        appId: appId,
                        users: userInsertResponse,
                        groups: groupInsertResponse,
                        sourceStudioName: sourceStudioName,
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

            try {
                var collabControllerUtils = new CollabControllerUtils();
            } catch (e) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessage("Valid controller is not found"))
                    .setDetail(e);
            }

            var redirectToController = !collabControllerUtils.isCurrentInstanceController() && collabControllerUtils.isControllerConfigured;
            var recordState = CollabTaskConstants.collabTaskStates;
            var collabTasksInScope = [];

            if (redirectToController) {
                try {
                    var getCollabTasksOutput = CollabTaskUtils.getCollaborationTaskRecordsFromController(appId, recordState.NEW, collabControllerUtils.getControllerRecord());

                } catch (e) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessage("Something went wrong when fetching collaboration requests from controller"))
                        .setDetail(e.message || e || gs.getMessage("Unknown error when fetching task records from controller environment"));
                }

                if (getCollabTasksOutput.hasError) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(getCollabTasksOutput.statusCode)
                        .setMessage(gs.getMessage("Something went wrong when fetching collaboration requests from controller"))
                        .setDetail(getCollabTasksOutput.errorMessage);
                }

                collabTasksInScope = getCollabTasksOutput.collabTasksInScope;
            } else {
                collabTasksInScope = CollabTaskUtils.getCollaborationRequestsInScope(appId, recordState.NEW);
            }

            return {
                body: {
                    appId: appId,
                    collabTasks: collabTasksInScope
                },
                status: statusCodes.SUCCESS
            };
        },

        /* Gets logged in user's opened collaboration tasks */
        getUserPendingCollaborationTasks: function(appSysIDs) {
            try {
                var collabControllerUtils = new CollabControllerUtils();
            } catch (e) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessage("Valid controller is not found"))
                    .setDetail(e);
            }
            var redirectToController = !collabControllerUtils.isCurrentInstanceController() && collabControllerUtils.isControllerConfigured;
            var collabTaskStates = CollabTaskConstants.collabTaskStates;
            var statusCodes = CollabTaskConstants.statusCodes;
            var collabTasks = [];

            if (redirectToController) {
                try {
                    var getCollabTasksOutput = CollabTaskUtils.getUserCollaborationTaskRecordsFromController(appSysIDs, collabTaskStates.NEW, collabControllerUtils.getControllerRecord());
                    collabTasks = getCollabTasksOutput.collabTasks;
                } catch (ex) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessage(ex.message))
                        .setDetail(ex);
                }

            } else {
                try {
                    collabTasks = CollabTaskUtils.getPendingUserCollabRecords(appSysIDs, collabTaskStates.NEW, gs.getUserID());
                } catch (ex) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessage(ex.message))
                        .setDetail(ex);
                }
            }
            collabTasks = collabTasks.map(function(task) {
                var taskData = {}
                taskData['appSysId'] = task.app_sys_id;
                taskData['sysId'] = task.sys_id;
                return taskData;
            });
            return {
                body: {
                    pendingCollabTasks: collabTasks
                },
                status: statusCodes.SUCCESS
            };
        },

        /*
        	Cancels collaboration task record with provided task id
        */
        cancelCollaborationTask: function(taskID) {
            var statusCodes = CollabTaskConstants.statusCodes;
            try {
                var collabControllerUtils = new CollabControllerUtils();
            } catch (e) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessage("Valid controller is not found"))
                    .setDetail(e);
            }

            var redirectToController = !collabControllerUtils.isCurrentInstanceController() && collabControllerUtils.isControllerConfigured;
            if (redirectToController) {
                try {
                    var cancelCollaborationResponse = CollabTaskUtils.cancelCollaborationTaskFromController(taskID, collabControllerUtils.getControllerRecord());
                    if (cancelCollaborationResponse.hasError) {
                        throw new sn_ws_err.ServiceError()
                            .setStatus(cancelCollaborationResponse.statusCode)
                            .setMessage(gs.getMessage("Something went wrong when cancelling collaboration request from controller"))
                            .setDetail(cancelCollaborationResponse.errorMessage);
                    }
                } catch (e) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessage("Something went wrong when cancelling collaboration requests from controller"))
                        .setDetail(e.message || e || gs.getMessage("Unknown error when cancelling task record from controller environment"));
                }

            } else {
                CollabTaskUtils.cancelCollaborationTask(taskID, gs.getUserID());
            }

            return {
                body: {
                    taskId: taskID,
                    message: gs.getMessage("Successfully cancelled the collaboration task")

                },
                status: statusCodes.SUCCESS
            };
        },
		getControllerInfo: function() {
			var statusCodes = CollabTaskConstants.statusCodes;
            var collabControllerUtils = new CollabControllerUtils();
			var pluginDetails = collabControllerUtils.getVersionInstalledInController();
            return {
                body: pluginDetails,
                status: statusCodes.SUCCESS
            };
        }
    };
})();
