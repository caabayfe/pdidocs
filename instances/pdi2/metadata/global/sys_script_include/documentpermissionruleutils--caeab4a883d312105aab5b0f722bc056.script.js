var DocumentPermissionRuleUtils = Class.create();
var EXECUTION_TYPE_SYS_SCHEDULED = "system_scheduled";
var EXECUTION_TYPE_SCHEDULED = "scheduled";
var EXECUTION_TYPE_IMMEDIATE = "immediate";

DocumentPermissionRuleUtils.prototype = {

    /**
     * Initializes the DocumentPermissionRuleUtils class with the provided table name and record SysID.
     *
     * @param {String} tableName - The name of the table.
     * @param {String} recordSysID - The SysID of the record.
     */
    initialize: function(tableName, recordSysID) {
        this.tableName = tableName;
        this.recordSysID = recordSysID;
    },

    /**
     * Executes the permission rules for the given table and record SysID.
     * Validates inputs, retrieves documents mapped to the record, determines the provider, 
     * and fetches matching permission rules.
     *
     * @returns {Object} The status and message of the execution process.
     */
    execute: function() {
        try {
            this._validateInputs();
            var documents = this._getDocumentsMappedToRecord();
            if (documents.length === 0) {
                return this._createResponse("Success", "No documents are referred to the given record");
            }
            var providerSysId = this._determineProviderFromDocuments(documents.join(','));
            var permissionRules = this._getMatchingPermissionRules(providerSysId);
            if (!permissionRules || permissionRules.length === 0) {
            	return this._createResponse("Success", "No active permission rules found for the given record");
            }
            if (!providerSysId) {
                return this._createResponse("Success", "No external documents are referred to the given record");
            }
            var providerName = this._getProviderName(providerSysId);
            var userRoleMapping = this._createUserRoleMapping(permissionRules, providerName);
            this._updateDocumentUserAccess(documents, userRoleMapping);
            return this._createResponse("Success", "Permission execution in progress");
        } catch (err) {
            var errorMessage = gs.getMessage("Error while executing permission rules for table: {0} and record sys ID: {1}", [this.tableName, this.recordSysID]);
            gs.error('DocumentPermissionRuleUtils: {0} caused by {1}.', errorMessage, err.message || err);
            return this._createResponse("Error", errorMessage);
        }
    },

    /**
     * Validates the input table name and record SysID.
     * Ensures both inputs are provided and that the record exists in the specified table.
     *
     * @throws {Error} If inputs are invalid or the record does not exist.
     */
    _validateInputs: function() {
        if (!this.tableName || !this.recordSysID) {
            throw new Error("Invalid input: tableName and recordSysID are required.");
        }

        var record = new GlideRecord(this.tableName);
        if (!record.get(this.recordSysID)) {
            throw new Error("Record with sys ID " + this.recordSysID + " in table " + this.tableName + " does not exist.");
        }
    },

    /**
     * Fetches matching permission rules based on the provider and conditions.
     *
     * @param {String} provider - SysID of the provider determined from documents.
     * @returns {Array} An array of matching permission rule objects.
     */
    _getMatchingPermissionRules: function(provider) {
        var matchingRules = [];

        var documentConfigGr = new GlideRecord('ds_document_configuration');
        documentConfigGr.addActiveQuery();
        documentConfigGr.addQuery('table', this.tableName);
        documentConfigGr.addQuery('provider', provider);
        documentConfigGr.orderBy('order');
        documentConfigGr.query();

        while (documentConfigGr.next()) {
            if (this._matchesCondition(documentConfigGr.condition, this.tableName, this.recordSysID)) {
                var permissionRuleGr = new GlideRecord('ds_permission_rule');
                permissionRuleGr.addActiveQuery();
                permissionRuleGr.addQuery('document_configuration', documentConfigGr.sys_id);
                permissionRuleGr.query();

                while (permissionRuleGr.next()) {
                    if (this._matchesCondition(permissionRuleGr.condition, this.tableName, this.recordSysID)) {
                        matchingRules.push({
                            sys_id: permissionRuleGr.sys_id.toString(),
                            external_permission: permissionRuleGr.external_permission.toString(),
                            internal_permission: permissionRuleGr.internal_permission.toString(),
                            users: permissionRuleGr.users.toString()
                        });
                    }
                }
                break;
            }
        }

        return matchingRules;
    },

    /**
     * Checks if a record matches the specified condition.
     *
     * @param {String} condition - The condition to evaluate.
     * @param {String} tableName - The name of the table.
     * @param {String} recordSysID - The SysID of the record.
     * @returns {Boolean} True if the condition matches; otherwise, false.
     */
    _matchesCondition: function(condition, tableName, recordSysID) {
        if (!condition) {
            return true;
        }

        var recordGr = new GlideRecord(tableName);
        if (recordGr.get(recordSysID)) {
            var filter = new GlideFilter(condition, 'filterCondition');
            return filter.match(recordGr, true);
        }

        return false;
    },

    /**
     * Retrieves all documents mapped to the specified table and record.
     *
     * @returns {String} A comma-separated list of document SysIDs.
     * @throws {Error} If no documents are found for the record.
     */
    _getDocumentsMappedToRecord: function() {
        var documents = [];
        var documentReferences = new GlideRecord("ds_document_references");
        documentReferences.addQuery('table_name', this.tableName);
        documentReferences.addQuery('target_record', this.recordSysID);
        documentReferences.query();

        while (documentReferences.next()) {
            documents.push(documentReferences.getValue("document"));
        }
        return documents;
    },

    /**
     * Determines the provider from a list of document SysIDs.
     * Ensures all documents have a consistent provider.
     *
     * @param {String} documentsList - A comma-separated list of document SysIDs.
     * @returns {String} The provider detail SysID.
     * @throws {Error} If documents have inconsistent providers.
     */
    _determineProviderFromDocuments: function(documentsList) {
        var provider = null;
        var documentGr = new GlideRecord("ds_document");
        documentGr.addQuery("sys_id", "IN", documentsList);
        documentGr.addQuery("external", true);
        documentGr.query();

        while (documentGr.next()) {
            var currentProvider = documentGr.getValue("external_provider");
            if (!provider) {
                provider = currentProvider;
            } else if (provider !== currentProvider) {
                throw new Error("Documents have inconsistent providers.");
            }
        }

        return provider;
    },

    /**
     * Creates a user-role mapping based on the permission rules.
     * The users are fetched dynamically from the target table and record.
     *
     * @param {Array} permissionRules - The array of permission rule objects.
     * @param {String} providerName - The name of the provider.
     * @returns {Object} A mapping of user SysIDs to their internal and external permissions.
     */
    _createUserRoleMapping: function(permissionRules, providerName) {
        var userRoleMapping = {};

        // Loop through each permission rule and fetch the users
        permissionRules.forEach(function(rule) {
            var userFields = rule.users;

            if (!userFields) {
                return; // Skip if no user field is provided
            }

            var users = this._fetchUsersFromRecord(userFields);
            users.forEach(function(user) {
                if (!userRoleMapping[user.userSysId]) {
                    // Add user to the map if not already present
                    userRoleMapping[user.userSysId] = {
                        internalPermission: rule.internal_permission,
                        externalPermission: rule.external_permission,
                        executionType: user.executionType
                    };
                } else {
                    // Resolve collision: Update to higher/lower permission based on logic
                    userRoleMapping[user.userSysId] = this._resolvePermissionCollision(
                        userRoleMapping[user.userSysId], {
                            internalPermission: rule.internal_permission,
                            externalPermission: rule.external_permission,
                            executionType: user.executionType
                        }, providerName
                    );
                }
            }, this);
        }, this);

        return userRoleMapping;
    },

    /**
     * Resolves permission collisions for a user by comparing existing and new permissions.
     *
     * @param {Object} existingPermissions - Current permissions for the user.
     * @param {Object} newPermissions - New permissions to compare.
     * @param {String} providerName - The name of the provider.
     * @returns {Object} The resolved permission object.
     */
    _resolvePermissionCollision: function(existingPermissions, newPermissions, providerName) {
        return {
            internalPermission: this._getHigherPermission(
                existingPermissions.internalPermission,
                newPermissions.internalPermission,
                "internal" // provider name for internal permissions is "internal"
            ),
            externalPermission: this._getHigherPermission(
                existingPermissions.externalPermission,
                newPermissions.externalPermission,
                providerName
            ),
            executionType: this._getHigherExecutionType(
                existingPermissions.executionType,
                newPermissions.executionType
            )
        };
    },

    /**
     * Compares two permissions and returns the higher one.
     * Assumes permissions are ordered in ascending priority.
     *
     * @param {String} permission1 - The first permission to compare.
     * @param {String} permission2 - The second permission to compare.
     * @param {String} providerName - The name of the provider.
     * @returns {String} The higher permission.
     */
    _getHigherPermission: function(permission1, permission2, providerName) {
        var priority1 = this._fetchPermissionPriority(permission1, providerName);
        var priority2 = this._fetchPermissionPriority(permission2, providerName);

        return priority1 > priority2 ? permission1 : permission2;
    },

    /**
     * Fetches the priority of a permission for a given provider.
     *
     * @param {String} permission - The permission to fetch the priority for.
     * @param {String} providerName - The name of the provider.
     * @returns {Number} The priority of the permission.
     */
    _fetchPermissionPriority: function(permission, providerName) {
        var permissionPriorityGr = new GlideRecord("ds_permission_priority");
        permissionPriorityGr.addQuery("provider_name", providerName);
        permissionPriorityGr.addQuery("name", permission);
        permissionPriorityGr.query();
        if (permissionPriorityGr.next()) {
            return permissionPriorityGr.priority;
        }
        return 0;
    },

    /**
     * Compares two execution types and returns the higher one.
     * Assumes execution types are ordered in ascending priority.
     *
     * @param {String} executionType1 - The first execution type to compare.
     * @param {String} executionType2 - The second execution type to compare.
     * @returns {String} The higher execution type.
     */
    _getHigherExecutionType: function(executionType1, executionType2) {
        var executionPriority = [EXECUTION_TYPE_SYS_SCHEDULED, EXECUTION_TYPE_SCHEDULED, EXECUTION_TYPE_IMMEDIATE];
        var index1 = executionPriority.indexOf(executionType1);
        var index2 = executionPriority.indexOf(executionType2);

        return index1 > index2 ? executionType1 : executionType2;
    },

    /**
     * Fetches the user SysIDs from the specified fields in the target record.
     *
     * @param {String} userFields - The fields containing user SysIDs (comma-separated or a list).
     * @returns {Array} An array of user objects with SysIDs and execution types.
     */
    _fetchUsersFromRecord: function(userFields) {
        var recordGr = new GlideRecord(this.tableName);
        if (!recordGr.get(this.recordSysID)) return [];

        var users = [];
        userFields.split(',').forEach(function(field) {
            var fieldValue;
            if (field.includes('.')) {
                var initialField = field.split('.')[0];
                fieldValue = recordGr.getElement(initialField).getElementValue(field);
            } else {
                fieldValue = recordGr.getValue(field);
            }

            if (!fieldValue) return;

            var fieldED = recordGr.getElement(field).getED();
            if (fieldED.isReference()) {
                users.push({
                    userSysId: fieldValue,
                    executionType: EXECUTION_TYPE_IMMEDIATE
                });
            } else if (fieldED.isList()) {
                fieldValue.split(',').forEach(user => {
                    users.push({
                        userSysId: user,
                        executionType: EXECUTION_TYPE_SCHEDULED
                    });
                });
            }
        });

        return users;
    },

    /**
     * Updates or inserts user permission records for each document.
     * Finally calls the Document Collaboration subflow to assign permissions in external cloud
     *
     * @param {Array} documents - An array of document sys_ids.
     * @param {Object} userRoleMapping - A mapping of user sys_ids to permission objects.
     */
    _updateDocumentUserAccess: function(documents, userRoleMapping) {
        documents.forEach(function(documentSysId) {
            this._setDocumentSharingPermission(documentSysId);
            this._updateOrInsertUserPermissions(documentSysId, userRoleMapping);
            this._updateNonMappedUserPermissions(documentSysId, userRoleMapping);
            this._initiateDocumentCollaborationSubflow(documentSysId);
        }, this);
    },

    /**
     * Updates or inserts user permission records for a specific document.
     *
     * @param {String} documentSysId - The sys_id of the document.
     * @param {Object} userRoleMapping - A mapping of user sys_ids to permission objects.
     */
    _updateOrInsertUserPermissions: function(documentSysId, userRoleMapping) {
        for (var userSysId in userRoleMapping) {
            if (userRoleMapping.hasOwnProperty(userSysId)) {
                var userPermissions = userRoleMapping[userSysId];
                var userAccessGr = new GlideRecord('ds_document_user_can_access_mtom');
                userAccessGr.addQuery('document', documentSysId);
                userAccessGr.addQuery('user', userSysId);
                userAccessGr.query();
                if (userAccessGr.next()) {
                    this._updateUserPermissionRecord(userAccessGr, userPermissions);
                } else {
                    if (userPermissions.internalPermission !== "no_access") {
                        this._insertUserPermissionRecord(userAccessGr, documentSysId, userSysId, userPermissions);
                    }
                }
            }
        }
    },

    /**
     * Updates an existing user permission record.
     *
     * @param {Object} userAccessGr - The GlideRecord object for the user permission.
     * @param {Object} userPermissions - The permission object for the user.
     */
    _updateUserPermissionRecord: function(userAccessGr, userPermissions) {
        var needsUpdate = false;
        var externalPermissionValue = this._getExternalPermissionValue(userPermissions.externalPermission);
        if (userAccessGr.getValue("external_permission") !== externalPermissionValue) {
            userAccessGr.setValue("external_permission", externalPermissionValue);
            needsUpdate = true;
        }
        if (userAccessGr.getValue("internal_permission") !== userPermissions.internalPermission) {
            userAccessGr.setValue("internal_permission", userPermissions.internalPermission);
            needsUpdate = true;
        }

        if (needsUpdate) {
            userAccessGr.setValue("external_permission_status", "pending");
            userAccessGr.setValue("permission_sync_strategy", userPermissions.executionType);
            userAccessGr.setValue("record_source", "api");
            userAccessGr.setValue("status_message", "");
            userAccessGr.setValue("retries", 0);
            userAccessGr.update();
        }
    },

    /**
     * Inserts a new user permission record.
     *
     * @param {Object} userAccessGr - The GlideRecord object for the user permission.
     * @param {String} documentSysId - The sys_id of the document.
     * @param {String} userSysId - The sys_id of the user.
     * @param {Object} userPermissions - The permission object for the user.
     */
    _insertUserPermissionRecord: function(userAccessGr, documentSysId, userSysId, userPermissions) {
        userAccessGr.initialize();
        userAccessGr.setValue("document", documentSysId);
        userAccessGr.setValue("user", userSysId);
        userAccessGr.setValue("external_permission_status", "pending");
        userAccessGr.setValue("permission_sync_strategy", userPermissions.executionType);
        userAccessGr.setValue("external_permission", this._getExternalPermissionValue(userPermissions.externalPermission));
        userAccessGr.setValue("internal_permission", userPermissions.internalPermission);
        userAccessGr.setValue("permission", userPermissions.internalPermission);
        userAccessGr.setValue("record_source", "api");
        userAccessGr.insert();
    },

    /**
     * Updates user permission records for users not in the mapping.
     *
     * @param {String} documentSysId - The sys_id of the document.
     * @param {Object} userRoleMapping - A mapping of user sys_ids to permission objects.
     */
    _updateNonMappedUserPermissions: function(documentSysId, userRoleMapping) {
        var wantedUserSysIDs = Object.keys(userRoleMapping);
        var userAccessGr = new GlideRecord('ds_document_user_can_access_mtom');
        userAccessGr.addQuery('document', documentSysId);
        userAccessGr.addQuery('user', 'NOT IN', wantedUserSysIDs);
        userAccessGr.addQuery('record_source', "api");
        userAccessGr.query();
        while (userAccessGr.next()) {
            userAccessGr.setValue("external_permission_status", "pending");
            userAccessGr.setValue("permission_sync_strategy", EXECUTION_TYPE_SCHEDULED);
            userAccessGr.setValue("external_permission", "no_access");
            userAccessGr.setValue("internal_permission", "no_access");
            userAccessGr.setValue("retries", 0);
            userAccessGr.setValue("status_message", "");
            userAccessGr.update();
        }
    },

    /**
     * Sets the sharing permission for a document.
     *
     * @param {String} documentSysId - The sys_id of the document.
     */
    _setDocumentSharingPermission: function(documentSysId) {
        var documentGr = new GlideRecord("ds_document");
        if (documentGr.get(documentSysId)) {
            if (documentGr.getValue("share_access") == false) {
                documentGr.setValue("share_access", "true");
                documentGr.update();
            }
        }
    },

    /**
     * Initiates the document collaboration subflow in async mode.
     *
     * @param {String} documentSysId - The sys_id of the document.
     */
    _initiateDocumentCollaborationSubflow: function(documentSysId) {
        try {
            var documentCollaborationSubflow = 'global.immediate_document_collaboration';
            var inputs = {};
            inputs['document_sys_id'] = documentSysId;
            sn_fd.FlowAPI.getRunner().subflow(documentCollaborationSubflow).inBackground().withInputs(inputs).run();
        } catch (ex) {
            var message = ex.getMessage();
            gs.error(message);
            throw new Error("Error while executing document collaboration subflow : " + message);
        }
    },

    /**
     * Retrieves the provider name for a given provider system ID.
     *
     * @param {string} providerSysId - The system ID of the provider.
     * @returns {string} The name of the provider if found.
     * @throws {Error} If the providerSysId is null, undefined, or does not exist in the table.
     */
    _getProviderName: function(providerSysId) {
        var provider = new GlideRecord("mp_provider_detail");
        if (provider.get(providerSysId)) {
            return provider.getValue("provider_name");
        }

        throw new Error("Provider not found for the given providerSysId : " + providerSysId);
    },

    /**
     * Retrieves the external permission value based on the provided permission name.
     *
     * @param {String} externalPermissionName - The name of the external permission.
     * @returns {String} The corresponding permission value.
     */
    _getExternalPermissionValue: function(externalPermissionName) {
        switch (externalPermissionName) {
            case "ms_reader":
                return "read";
            case "ms_writer":
                return "write";
            case "g_reader":
                return "reader";
            case "g_writer":
                return "writer";
            case "g_commenter":
                return "commenter";
            default:
                return "no_access";
        }
    },
    /**
     * Creates a response object with the given status and message.
     *
     * @param {String} status - The status of the response.
     * @param {String} [message] - The message of the response.
     * @returns {Object} The response object.
     */
    _createResponse: function(status, message) {
        return {
            status: status,
            message: message || ""
        };
    },

    type: 'DocumentPermissionRuleUtils'
};
