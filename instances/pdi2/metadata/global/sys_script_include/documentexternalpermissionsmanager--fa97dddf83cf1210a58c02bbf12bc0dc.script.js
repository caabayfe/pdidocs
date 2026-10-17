var DocumentExternalPermissionsManager = Class.create();
DocumentExternalPermissionsManager.prototype = {
    initialize: function() {},

    /**
     * Updates user permission in external provider based on the data available in the
     * given user permission record.
     *
     * @userPermissionSysId - Sys Id of a User Permissions Record
     */
    updateUserPermission: function(userPermissionSysId) {
        var STATUS_ERROR = 'Error';
        var STATUS_SUCCESS = 'Success';

        if (!userPermissionSysId) {
            gs.error('DocumentExternalPermissionsManager: Mandatory input User Permission sys id is not provided.');
            return this._createResponse(STATUS_ERROR, "Invalid input.");
        }

        try {
            var userPermissionsGR = this._getUserPermissionRecord(userPermissionSysId);
            var extPermission = userPermissionsGR.getValue('external_permission');
            if (!extPermission) {
                return this._createResponse(STATUS_ERROR, 'External permission field value is not set on the user permission record.');
            }

            var documentGR = this._getDocumentRecord(userPermissionsGR.getValue('document'));
            if (!documentGR.external) {
                return this._createResponse(STATUS_SUCCESS, 'External permissions cannot be applied for internal document.');
            }

            // if external permission id is not assigned already but the new permission to be assigned is "No Access" then we can delete the user permission record directly, if internal permission is also "No Access"
            var extPermissionId = userPermissionsGR.getValue('external_permission_id');
            if (extPermission === 'no_access' && !extPermissionId) {
                if (userPermissionsGR.getValue('internal_permission') === 'no_access') {
                    userPermissionsGR.deleteRecord();
                } else {
                    userPermissionsGR.setValue('status_message', 'New external permission is no_access but external permission id does not exist on the user permission record. Skipping operation.');
                    userPermissionsGR.setValue('external_permission_status', 'success');
                    userPermissionsGR.update();
                }
                return this._createResponse(STATUS_SUCCESS, 'User permission updated successfully.');
            }

            this._updateExtenalPermissionStatus(userPermissionsGR, 'in_progress');
            this._callRequiredDocumentAction(userPermissionsGR, documentGR);
            return this._createResponse(STATUS_SUCCESS, 'User permission updated successfully.');
        } catch (err) {
            var errorMessage = 'Error while updating the user permission for the given sys id: ' + userPermissionSysId;
            gs.error('DocumentExternalPermissionsManager: {0} caused by {1}.', errorMessage, err.message || err);
            return this._createResponse(STATUS_ERROR, errorMessage);
        }
    },

    _getUserPermissionRecord: function(userPermissionSysId) {
        var USER_PERMISSION_TABLE_NAME = 'ds_document_user_can_access_mtom';
        var userPermissionGR = new GlideRecord(USER_PERMISSION_TABLE_NAME);
        if (userPermissionGR.get(userPermissionSysId)) {
            return userPermissionGR;
        }
        throw new Error("User Permission record does not exist for the given sys id: " + userPermissionSysId);
    },

    _getDocumentRecord: function(documentSysId) {
        var DOCUMENT_TABLE_NAME = 'ds_document';
        var documentGR = new GlideRecord(DOCUMENT_TABLE_NAME);
        if (documentGR.get(documentSysId)) {
            return documentGR;
        }
        throw new Error("Document record does not exist with the sys id: " + documentSysId);
    },

    _getMultiProviderDocumentRecord: function(multiProviderDocumentSysId) {
        var MP_DOCUMENT_TABLE_NAME = 'mp_document';
        var mpDocumentGR = new GlideRecord(MP_DOCUMENT_TABLE_NAME);
        if (mpDocumentGR.get(multiProviderDocumentSysId)) {
            return mpDocumentGR;
        }
        throw new Error("Multi Provider Document record does not exist with the sys id: " + multiProviderDocumentSysId);
    },

    _getExternalProviderName: function(sysId) {
        var MP_PROVIDER_DETAIL_TABLE_NAME = 'mp_provider_detail';
        var PROVIDER_NAME_FIELD = 'provider_name';
        var mpProviderDetailGR = new GlideRecord(MP_PROVIDER_DETAIL_TABLE_NAME);
        if (mpProviderDetailGR.get(sysId)) {
            return mpProviderDetailGR.getValue(PROVIDER_NAME_FIELD);
        }
        throw new Error("MP Provider Detail record does not exist with the sys id: " + sysId);
    },

    _updateExtenalPermissionStatus: function(userPermissionsGR, statusValue) {
        userPermissionsGR.setValue('external_permission_status', statusValue);
        userPermissionsGR.update();
    },

    _callRequiredDocumentAction: function(userPermissionsGR, documentGR) {
        var actionName = this._getDocumentActionName(userPermissionsGR);
        var providerDetailSysId = this._getProviderDetailSysId(documentGR);
        var multiProviderDocumentGR = this._getMultiProviderDocumentRecord(documentGR.getValue('mp_document'));
        var subFlowInputs = this._createSubFlowInputs(actionName, userPermissionsGR, documentGR);
        var mpDocManager = new global.MultiProviderDocumentsManager();
        var result;
        try {
            result = mpDocManager.executeAction(actionName, providerDetailSysId, subFlowInputs, multiProviderDocumentGR, null);
        } catch (err) {
            result = {
                "status": 'Error',
                "error_message": 'Error while executing document action: ' + err.message
            };
        }
        this._handleDocActionResult(result, userPermissionsGR.getValue('sys_id'), actionName, documentGR);
    },

    _getDocumentActionName: function(userPermissionsGR) {
        var EXT_PERMISSION_ID_FIELD = 'external_permission_id';
        var EXT_PERMISSION_FIELD = 'external_permission';
        var extPermissionId = userPermissionsGR.getValue(EXT_PERMISSION_ID_FIELD);
        var extPermission = userPermissionsGR.getValue(EXT_PERMISSION_FIELD);

        // if external permission id is not assigned already then user has to be added as a new collaborator
        if (!extPermissionId)
            return 'Add collaborator to document';

        // if the new permission assigned to be "No Access" then revoke collaboration
        if (extPermission == 'no_access')
            return 'Revoke Collaboration';

        // if none of the above matches then it means changing existing external permission
        return 'Update Collaboration';
    },

    _getProviderDetailSysId: function(documentGR) {
        var EXT_PROVIDER_FIELD = 'external_provider';
        return documentGR.getValue(EXT_PROVIDER_FIELD);
    },

    _createSubFlowInputs: function(actionName, userPermissionsGR, documentGR) {
        var providerName = this._getExternalProviderName(this._getProviderDetailSysId(documentGR));
        if (actionName == 'Add collaborator to document')
            return this._createAddCollaboratorSubFlowInputs(userPermissionsGR, documentGR, providerName);
        if (actionName == 'Update Collaboration')
            return this._createUpdateCollaborationSubFlowInputs(userPermissionsGR, documentGR, providerName);
        return this._createRevokeCollaborationSubFlowInputs(userPermissionsGR, documentGR, providerName);
    },

    _createAddCollaboratorSubFlowInputs: function(userPermissionsGR, documentGR, providerName) {
        var subFlowInputs = {};
        // common inputs
        subFlowInputs['document_sys_id'] = documentGR.getValue('mp_document');

        // Provider specific inputs
        if (providerName.toLowerCase() == "onedrive") {
            this._populateInputsForAddCollabInOneDrive(subFlowInputs, userPermissionsGR);
        } else {
            this._populateInputsForAddCollabInGDrive(subFlowInputs, userPermissionsGR, documentGR);
        }

        return subFlowInputs;
    },

    _populateInputsForAddCollabInOneDrive: function(subFlowInputs, userPermissionsGR) {
        subFlowInputs['recipient_type'] = 'email';
        subFlowInputs['recipient_value'] = this._getUserEmail(userPermissionsGR.getValue('user'));
        subFlowInputs['permission'] = userPermissionsGR.getValue('external_permission');
        subFlowInputs['requires_sign_in'] = true;
        subFlowInputs['send_invitation'] = false;
    },

    _populateInputsForAddCollabInGDrive: function(subFlowInputs, userPermissionsGR, documentGR) {
        subFlowInputs['provider_detail_sys_id'] = this._getProviderDetailSysId(documentGR);
        subFlowInputs['type'] = 'user';
        subFlowInputs['email_address'] = this._getUserEmail(userPermissionsGR.getValue('user'));
        subFlowInputs['role'] = userPermissionsGR.getValue('external_permission');
    },

    _getUserEmail: function(userSysId) {
        var userGR = new GlideRecord('sys_user');
        if (userGR.get(userSysId)) {
            return userGR.getValue('email');
        }
        throw new Error("User record does not exist with the sys id: " + userSysId);
    },

    _createUpdateCollaborationSubFlowInputs: function(userPermissionsGR, documentGR, providerName) {
        var subFlowInputs = {};
        // common inputs
        subFlowInputs['document_sys_id'] = documentGR.getValue('mp_document');

        // Provider specific inputs
        if (providerName.toLowerCase() == "onedrive") {
            this._populateInputsForUpdateCollabInOneDrive(subFlowInputs, userPermissionsGR);
        } else {
            this._populateInputsForUpdateCollabInGDrive(subFlowInputs, userPermissionsGR);
        }

        return subFlowInputs;
    },

    _populateInputsForUpdateCollabInOneDrive: function(subFlowInputs, userPermissionsGR) {
        subFlowInputs['collaboration_id'] = userPermissionsGR.getValue('external_permission_id');
        subFlowInputs['permission'] = userPermissionsGR.getValue('external_permission');
    },

    _populateInputsForUpdateCollabInGDrive: function(subFlowInputs, userPermissionsGR) {
        subFlowInputs['permission_id'] = userPermissionsGR.getValue('external_permission_id');
        subFlowInputs['role'] = userPermissionsGR.getValue('external_permission');
    },

    _createRevokeCollaborationSubFlowInputs: function(userPermissionsGR, documentGR, providerName) {
        var subFlowInputs = {};
        // common inputs
        subFlowInputs['document_sys_id'] = documentGR.getValue('mp_document');

        // Provider specific inputs
        if (providerName.toLowerCase() == "onedrive") {
            this._populateInputsForRevokeCollabInOneDrive(subFlowInputs, userPermissionsGR);
        } else {
            this._populateInputsForRevokeCollabInGDrive(subFlowInputs, userPermissionsGR);
        }

        return subFlowInputs;
    },

    _populateInputsForRevokeCollabInOneDrive: function(subFlowInputs, userPermissionsGR) {
        subFlowInputs['collaboration_id'] = userPermissionsGR.getValue('external_permission_id');
    },

    _populateInputsForRevokeCollabInGDrive: function(subFlowInputs, userPermissionsGR) {
        subFlowInputs['permission_id'] = userPermissionsGR.getValue('external_permission_id');
    },

    _getExternalPermissionStatus: function(userPermissionSysId) {
        var userPermissionGR = this._getUserPermissionRecord(userPermissionSysId);
        return userPermissionGR.getValue('external_permission_status');
    },

    _handleDocActionResult: function(result, userPermissionSysId, actionName, documentGR) {
        // get user permission record again to get latest external permission status to know whether the status is changed from in-progress to pending while the subflow was getting executed i.e., new external permission is assigned
        var userPermissionGR = this._getUserPermissionRecord(userPermissionSysId);
        if (result.status.toLowerCase() == 'success') {
            this._handleSuccessResult(result, userPermissionGR, actionName);
        } else if (result.status.toLowerCase() == 'error') {
            this._handleErrorResult(result, userPermissionGR, documentGR);
            throw result.error_message;
        }
    },

    _handleSuccessResult: function(result, userPermissionGR, actionName) {
        if (actionName == 'Add collaborator to document') {
            // Onedrive returns permission id as "collaboration_id"
            userPermissionGR.setValue('external_permission_id', result.collaboration_id || result.permission_id);
        } else if (actionName == 'Update Collaboration') {
            // Nothing to update
        } else {
            // revoke collaboration case
            // check if internal_permission is set to no_access
            if (userPermissionGR.getValue('internal_permission') === 'no_access') {
                userPermissionGR.deleteRecord();
                return;
            }
            userPermissionGR.setValue('external_permission_id', '');
        }
        userPermissionGR.setValue('status_message', '');
        userPermissionGR.setValue('retries', 0);
        var latestExtPermissionStatus = userPermissionGR.getValue('external_permission_status');
        if (latestExtPermissionStatus != 'pending') {
            userPermissionGR.setValue('external_permission_status', 'success');
        }
        if (result.document_activity) {
            userPermissionGR.setValue('document_activity', result.document_activity);
        }
        userPermissionGR.update();
    },

    _handleErrorResult: function(result, userPermissionGR, documentGR) {
        if (result.error_message) {
            userPermissionGR.setValue('status_message', result.error_message);
        }
        if (result.document_activity) {
            userPermissionGR.setValue('document_activity', result.document_activity);
        }
        var latestExtPermissionStatus = userPermissionGR.getValue('external_permission_status');
        if (latestExtPermissionStatus != 'pending') {
            // while subflow was being executed, the user permission record didn't got updated with new permission
            var retries = userPermissionGR.getValue('retries');
            retries = retries != null ? Number(retries) : 0;
            if (retries >= 3) {
                userPermissionGR.setValue('external_permission_status', 'error');
                var userEmail = this._getUserEmail(userPermissionGR.getValue('user'));
                gs.eventQueue('ds_document.permission.assignment.failed', documentGR, userEmail, result ? result.error_message : '');
            } else {
                // set status back to pending so that scheduled flow will pick it up
                userPermissionGR.setValue('external_permission_status', 'pending');
                userPermissionGR.setValue('retries', retries + 1);
                userPermissionGR.setValue('permission_sync_strategy', 'system_scheduled');
            }
        }
        userPermissionGR.update();
    },

    _createResponse: function(status, message) {
        return {
            status: status,
            message: message || ""
        };
    },

    type: 'DocumentExternalPermissionsManager'
};
