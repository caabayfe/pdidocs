var MultiProviderDocumentsManager = Class.create();
MultiProviderDocumentsManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    //initialize: function() {		
    //this.timeout = 14400000;		
    //},		
    setTimeout: function(timeout) {
        this.timeout = timeout;
    },
    getTimeout: function() {
        return this.timeout != undefined ? this.timeout : 14400000;
    },
    executeAction: function(actionName, providerDetailSysId, subFlowInputs, document, activity, baseAlias, currentAlias) {
        baseAlias = (typeof baseAlias === 'undefined') ? '' : baseAlias;
        currentAlias = (typeof currentAlias === 'undefined') ? '' : currentAlias;
        // get document action
        var documentAction = new GlideRecord('mp_document_action');
        documentAction.addQuery('document_action_name', actionName);
        documentAction.addQuery('provider_detail', providerDetailSysId);
        documentAction.setLimit(1);
        documentAction.query();
        if (!activity) {
            activity = this.intializeDocumentActivity(document);
        }
        if (documentAction.next()) {
            var hasPermission = this.validateUserRoleForPermission(documentAction.provider_permission) && this.validateUserForPermission(actionName, providerDetailSysId, subFlowInputs, document);
            var documentActionSysId = documentAction.sys_id;
            var record = documentAction.subflow.getRefRecord();
            var packageId = record.sys_package;
            var scopeName = 'global';
            if (packageId) {
                var pck = new GlideRecord('sys_package');
                if (pck.get(packageId)) {
                    scopeName = pck.source;
                }
            }
            var sf = scopeName + '.' + record.internal_name;
            // save inputs to activity for reference
            var saveInputsToNotes = [];
            saveInputsToNotes.push('Inputs:\n');
            for (key in subFlowInputs) {
                var value = subFlowInputs[key];
                subFlowInputs[key] = value;
                saveInputsToNotes.push(key + ":" + value + "\n");
            }
            saveInputsToNotes = saveInputsToNotes.join("");
            activity.notes = saveInputsToNotes;
            if (document)
                activity.document_name = document.document_name;
            activity.document_action = documentAction.sys_id;
            activity.provider_detail = providerDetailSysId;
            activity.update();
            if (!hasPermission) {
                var noPermission = {};
                var noPermissionMessage = 'No permission to execute this action. Please contact admin';
                noPermission.status = 'error';
                noPermission.error_message = noPermissionMessage;
                var saveNoPermissionToNotes = [];
                saveNoPermissionToNotes.push(activity.notes);
                saveNoPermissionToNotes.push("Outputs:\n");
                saveNoPermissionToNotes.push('status: Error\n');
                saveNoPermissionToNotes.push('error_message: ' + noPermissionMessage + '\n');
                saveNoPermissionToNotes = saveNoPermissionToNotes.join('');
                activity.status = 'Error';
                activity.notes = saveNoPermissionToNotes;
                activity.update();
                noPermission.document_activity = activity.sys_id;
                return noPermission;
            }
            var existingNotes = activity.notes;
            try {
                var result;
                if (baseAlias !== '' && currentAlias !== '') {
                    //connection override
                    result = new sn_fd.FlowAPI.executeSubflow(sf, subFlowInputs, this.getTimeout()).withConnectionAliasOverride(baseAlias, currentAlias);
                } else {
                    result = new sn_fd.FlowAPI.executeSubflow(sf, subFlowInputs, this.getTimeout());
                }
                // save outputs to activity for reference
                var saveOutputsToNotes = [];
                saveOutputsToNotes.push(existingNotes);
                saveOutputsToNotes.push("Outputs:\n");
                for (key in result) {
                    saveOutputsToNotes.push(key + ': ' + result[key] + '\n');
                }
                saveOutputsToNotes = saveOutputsToNotes.join('');
                activity.notes = saveOutputsToNotes;
                activity.status = 'Success';
                activity.update();
                result.document_activity = activity.sys_id;
                return result;
            } catch (err) {
                // save exception to activity for reference
                var saveErrorToNotes = [];
                saveErrorToNotes.push(existingNotes);
                saveErrorToNotes.push("Exception:\n");
                saveErrorToNotes.push("exception:" + err);
                saveErrorToNotes = saveErrorToNotes.join('');
                activity.notes = saveErrorToNotes;
                activity.status = 'Error';
                activity.update();
                gs.error('executeAction: ' + err + ' . Refer to document activity for more details: ' + activity.sys_id);
                throw err;
            }
        } else {
            var errorMessage = 'warn: actionName ' + actionName + ' providerDetail ' + providerDetailSysId + ' not configured properly';
            gs.addErrorMessage(errorMessage);
            activity.status = 'Error';
            activity.notes = errorMessage;
            activity.update();
            throw errorMessage;
        }
    },
    createDocument: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (providerDetailSysId) {
            try {
                var documentActionName = 'Create Document';
                var activity = this.intializeDocumentActivity();
                var result = this.executeAction(documentActionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
                if (result) {
                    var documentId = result['document_sys_id'];
                    var documentName = result['document_name'];
                    activity.document_name = documentName;
                    activity.document_sys_id = documentId;
                    activity.update();
                }
                return result;
            } catch (err) {
                gs.error(err);
                throw err;
            }
        } else {
            throw 'Error: providerDetailSysId:' + providerDetailSysId + ' is mandatory';
        }
    },
    connectDocument: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (providerDetailSysId) {
            try {
                var documentActionName = 'Connect Document';
                var activity = this.intializeDocumentActivity();
                var result = this.executeAction(documentActionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
                if (result) {
                    var documentId = result['document_sys_id'];
                    var documentName = result['document_name'];
                    activity.document_name = documentName;
                    activity.document_sys_id = documentId;
                    activity.update();
                }
                return result;
            } catch (err) {
                gs.error(err);
                throw err;
            }
        } else {
            throw 'Error: providerDetailSysId:' + providerDetailSysId + ' is mandatory';
        }
    },
    // All updates to documents can be carried here except create of document
    updateActionOnDocument: function(documentActionName, documentSysId, inputs, baseAlias, currentAlias) {
        try {
            if (documentActionName && documentSysId) {
                var document = new GlideRecord('mp_document');
                document.get(documentSysId);
                var providerDetailSysId = document.getValue('provider_detail');
                var initializedActivity = this.intializeDocumentActivity(document);
                // execute corresponding action on document
                var result = this.executeAction(documentActionName, providerDetailSysId, inputs, document, initializedActivity, baseAlias, currentAlias);
                return result;
            } else {
                throw 'Error: documentActionName: ' + documentActionName + ', documentSysId: ' + documentSysId + ' are mandatory';
            }
        } catch (err) {
            gs.error(err);
            throw err;
        }
    },
    updateDocument: function() {
        var documentActionName = this.getParameter('sysparm_actionName');
        var documentSysId = this.getParameter('sysparm_documentSysId');
        var inputs = this.getParameter('sysparm_inputs_separated_by_semi_colon');
        var parsedInputs = this.parseSubFlowInputsBySemiColon(inputs);
        var output = this.updateActionOnDocument(documentActionName, documentSysId, parsedInputs);
        var result = JSON.encode(output);
        return result;
    },
    // All updates to document versions can be carried here
    updateActionOnDocumentVersion: function(documentActionName, documentVersionSysId, inputs, baseAlias, currentAlias) {
        try {
            if (documentActionName && documentVersionSysId) {
                var documentVersion = new GlideRecord('mp_document_version');
                documentVersion.get(documentVersionSysId);
                // get corresponding document
                var documentId = documentVersion.getValue('document');
                var document = new GlideRecord('mp_document');
                document.get(documentId);
                var providerDetailSysId = document.getValue('provider_detail');
                var initializedActivity = this.intializeDocumentActivity(document, documentVersion);
                // execute corresponding action on document version
                var result = this.executeAction(documentActionName, providerDetailSysId, inputs, document, initializedActivity, baseAlias, currentAlias);
                return result;
            } else {
                throw 'Error: documentActionName: ' + documentActionName + ', documentVersionSysId: ' + documentVersionSysId + ' are mandatory';
            }
        } catch (err) {
            gs.error(err);
            throw err;
        }
    },
    updateDocumentVersion: function() {
        var documentActionName = this.getParameter('sysparm_actionName');
        var documentVersionId = this.getParameter('sysparm_document_version_sys_id');
        var inputs = this.getParameter('sysparm_inputs_separated_by_semi_colon');
        var parsedInputs = this.parseSubFlowInputsBySemiColon(inputs);
        // execute corresponding action on document version
        var output = this.updateActionOnDocumentVersion(documentActionName, documentVersionId, parsedInputs);
        var result = JSON.encode(output);
        return result;
    },
    createGroup: function() {
        var actionName = this.getParameter('sysparm_actionName');
        var permissionConfigSysId = this.getParameter('sysparm_permissionConfigSysId');
        var inputs = this.getParameter('sysparm_inputs_separated_by_semi_colon');
        var parsedInputs = this.parseSubFlowInputsBySemiColon(inputs);
        var output = this.createGroupOnProvider(actionName, permissionConfigSysId, parsedInputs);
        var result = JSON.encode(output);
        return result;
    },
    createGroupOnProvider: function(actionName, permissionConfigSysId, inputs, baseAlias, currentAlias) {
        // From the permission Config record - get the permission List and then get the provider detail
        var providerDetail = '';
        var permissionGR = new GlideRecord('mp_permission_configuration');
        //var roleInput = 'role_sys_id=';
        //var inputs = "permission_configuration_sys_id=" + permissionConfigSysId;
        var roleId = '';
        if (permissionGR.get(permissionConfigSysId)) {
            if (permissionGR.entity_type == 'sys_user_role') {
                //roleInput = roleInput + permissionGR.entity_id;
                roleId = permissionGR.entity_id;
            }
            var permissionsArr = permissionGR.provider_permission.split(',');
            var gr = new GlideRecord('mp_provider_permission');
            if (gr.get(permissionsArr[0]))
                providerDetail = gr.provider_detail;
        }
        if (providerDetail == '' || roleId == '')
            return;
        //var parsedInputs = this.parseSubFlowInputsBySemiColon(inputs);
        var result = this.executeAction(actionName, providerDetail, inputs);
        return result;
    },
    getCollaborators: function() {
        var actionName = this.getParameter('sysparm_actionName');
        var providerDetailId = this.getParameter('sysparm_providerDetailId');
        var inputs = this.getParameter('sysparm_inputs_separated_by_semi_colon');
        var parsedInputs = this.parseSubFlowInputsBySemiColon(inputs);
        var output = this.getCollaboratorsFromProvider(actionName, providerDetailId, parsedInputs);
        var result = JSON.encode(output);
        return result;
    },
    getCollaboratorsFromProvider: function(actionName, providerDetailId, inputs) {
        var result = this.executeAction(actionName, providerDetailId, inputs);
        return result;
    },
    intializeDocumentActivity: function(document, documentVersion) {
        var documentActivity = new GlideRecord('mp_document_activity');
        documentActivity.initialize();
        if (document) {
            documentActivity.document_name = document.document_name;
            documentActivity.document_sys_id = document.sys_id;
        }
        if (documentVersion) {
            documentActivity.document_version_sys_id = documentVersion.sys_id;
        }
        documentActivity.insert();
        return documentActivity;
    },

    constructRoleSysIdName: function() {
        var allRoles = gs.getSession().getRoles().split(',');

        var initialQuery = [];
        for (var i = 0; i < allRoles.length; i++) {
            initialQuery.push('name=' + allRoles[i]);
        }

        // need to get sys_ids of the roles
        // so we query against sys_user_role using OR condition
        // name=admin^ORname=security
        var gr = new GlideRecord('sys_user_role');
        var strQuery = initialQuery.join('^OR');
        gr.addEncodedQuery(strQuery);
        gr.query();
        var allRoleSysIdName = [];

        while (gr.next()) {
            var roleSysIdName = {};
            roleSysIdName.sys_id = gr.getValue('sys_id');
            roleSysIdName.role_name = gr.getValue('name');
            allRoleSysIdName.push(roleSysIdName);
        }
        return allRoleSysIdName;
    },


    validateUserRoleForPermission: function(providerPermissionId) {
        // There are entries in permission configuration with given permission. Now check if user has appropriate role
        var userID = gs.getUserID();
        var systemUser = 'system';
        if (userID == systemUser)
            return true;

        var allRoleSysIdName = this.constructRoleSysIdName();

        for (var index = 0; index < allRoleSysIdName.length; index++) {
            var roleSysIdName = allRoleSysIdName[index];

            var permissionGR = new GlideRecord('mp_permission_configuration');
            permissionGR.addQuery('entity_id', roleSysIdName.sys_id);
            permissionGR.query();

            var roleExists = false;
            while (permissionGR.next()) {
                roleExists = true;
                var arr = permissionGR.provider_permission.split(',');
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == providerPermissionId) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    // custom logic can be provided to validate user for a given action
    validateUserForPermission: function(actionName, providerDetailSysId, subFlowInputs, document) {
        return true;
    },
    syncCollaborators: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (providerDetailSysId) {
            try {
                var documentActionName = 'Sync Collaborators';
                var activity = this.intializeDocumentActivity();
                var result = this.executeAction(documentActionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
                return result;
            } catch (err) {
                gs.error(err);
                throw err;
            }
        } else {
            throw 'Error: providerDetailSysId:' + providerDetailSysId + ' is mandatory';
        }
    },
    parseSubFlowInputsBySemiColon: function(inputs) {
        //parsing of form a=b;c=d
        var parsedInputs = {};
        if (inputs) {
            var inputsArray = inputs.split(';');
            for (var i = 0; i < inputsArray.length; i++) {
                var keyValue = inputsArray[i];
                var keyValueArray = keyValue.split('=');
                var key = keyValueArray[0];
                var value = keyValueArray[1];
                parsedInputs[String(key)] = String(value);
            }
        }
        return parsedInputs;
    },
    //This is used to fix recompile required for subflows for first call to subflow
    initializeSubflows: function(providerDetailName) {
        gs.info("initializeSubflows started ");
        if (providerDetailName) {
            try {
                var providerDetail = new GlideRecord('mp_provider_detail');
                providerDetail.addQuery('provider_detail_name', providerDetailName);
                providerDetail.setLimit(1);
                providerDetail.query();
                if (providerDetail.next()) {
                    var actions = new GlideRecord('mp_document_action');
                    actions.addQuery('provider_detail', providerDetail.sys_id);
                    actions.query();
                    while (actions.next()) {
                        var record = actions.subflow.getRefRecord();
                        var packageId = record.sys_package;
                        var scopeName = 'global';
                        if (packageId) {
                            var pck = new GlideRecord('sys_package');
                            if (pck.get(packageId)) {
                                scopeName = pck.source;
                            }
                        }
                        var subflowName = scopeName + '.' + record.internal_name;
                        try {
                            sn_fd.FlowAPI.getRunner().subflow(subflowName).inBackground().withInputs({}).timeout(1000).run();
                        } catch (err) {
                            //gs.error(err);
                        }
                    }
                }
            } catch (err) {
                gs.error(err);
            }
        }
        gs.info("initializeSubflows ended ");
    },
    getLatestUrl: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (providerDetailSysId) {
            try {
                var documentActionName = 'Get Document Latest URL';
                var activity = this.intializeDocumentActivity();
                var result = this.executeAction(documentActionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
                return result;
            } catch (err) {
                gs.error(err);
                throw err;
            }
        } else {
            throw 'Error: providerDetailSysId: ' + providerDetailSysId + ' is mandatory';
        }
    },
    reconnectDocument: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (providerDetailSysId) {
            try {
                var documentActionName = 'Reconnect Document From OneDrive';
                var activity = this.intializeDocumentActivity();
                var result = this.executeAction(documentActionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
                return result;
            } catch (err) {
                gs.error(err);
                throw err;
            }
        } else {
            throw 'Error: providerDetailSysId:' + providerDetailSysId + ' is mandatory';
        }
    },
    executeActionStream: function(actionName, scopeName, inputs, baseAlias, currentAlias) {
        try {
            baseAlias = (typeof baseAlias === 'undefined') ? '' : baseAlias;
            currentAlias = (typeof currentAlias === 'undefined') ? '' : currentAlias;
            gs.info('Executing Data Stream Action: ' + actionName + ' for scope: ' + scopeName);
            if (!actionName || !scopeName) {
                throw 'Action name and spoke name are required.';
            }
            // Execute Data Stream Action.
            var streamFullName = scopeName.toString() + '.' + actionName.toString();
            var dataStreamResult;
            if (baseAlias !== '' && currentAlias !== '') {
                //connection override
                dataStreamResult = sn_fd.FlowAPI.getRunner().datastream(streamFullName)
                    .withConnectionAliasOverride(baseAlias, currentAlias)
                    .timeout(this.getTimeout())
                    .withInputs(inputs)
                    .run();
            } else {
                dataStreamResult = sn_fd.FlowAPI.getRunner().datastream(streamFullName)
                    .timeout(this.getTimeout())
                    .withInputs(inputs)
                    .run();
            }
            var stream = dataStreamResult.getDataStream();
            outputs = {
                "outputItem": []
            };
            // Process each item in the data stream
            while (stream.hasNext()) {
                var targetobject = stream.next();
                outputs["outputItem"].push(targetobject);
            }
            gs.info('Action Stream executed successfully');
            return JSON.stringify(outputs);
        } catch (ex) {
            gs.error('An error occurred: ' + ex);
            throw ex;
        } finally {
            stream.close();
        }
    },
    executeSpokeAction: function(actionName, scopeName, inputs, baseAlias, currentAlias) {
        try {
            baseAlias = (typeof baseAlias === 'undefined') ? '' : baseAlias;
            currentAlias = (typeof currentAlias === 'undefined') ? '' : currentAlias;
            // Validate inputs
            gs.info('actionName: ' + actionName + ' for scope: ' + scopeName);
            if (!actionName || !scopeName) {
                throw 'Action name and spoke name are required.';
            }
            var actionFullName = scopeName.toString() + '.' + actionName.toString();
            var actionResult;
            if (baseAlias !== '' && currentAlias !== '') {
                //connection override
                actionResult = sn_fd.FlowAPI.getRunner().action(actionFullName)
                    .inForeground()
                    .withConnectionAliasOverride(baseAlias, currentAlias)
                    .timeout(this.getTimeout())
                    .withInputs(inputs)
                    .run();
            } else {
                actionResult = sn_fd.FlowAPI.getRunner().action(actionFullName)
                    .inForeground()
                    .timeout(this.getTimeout())
                    .withInputs(inputs)
                    .run();
            }

            gs.info('Action executed successfully');
            return actionResult.getOutputs();
        } catch (ex) {
            gs.error('Error occurred while executing Action in Foreground: ' + ex);
            throw ex;
        }
    },
    //Generic action executor
    executeDocumentAction: function(actionName, providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        if (!providerDetailSysId)
            throw 'Error: providerDetailSysId: ' + providerDetailSysId + ' is mandatory';
        if (!actionName)
            throw 'Error: actionName is mandatory';
        try {
            var activity = this.intializeDocumentActivity();
            var result = this.executeAction(actionName, providerDetailSysId, subFlowInputs, null, activity, baseAlias, currentAlias);
            return result;
        } catch (err) {
            gs.error('Error executing action: ' + actionName + ' - ' + err);
            throw err;
        }
    },
    lookupIncrementalFilesandFolders: function(providerDetailSysId, subFlowInputs, baseAlias, currentAlias) {
        return this.executeDocumentAction('Look Up Incremental Files and Folders', providerDetailSysId, subFlowInputs, baseAlias, currentAlias);
    },
    type: 'MultiProviderDocumentsManager'
});
