var MultiProviderDocumentsAPI = Class.create();
MultiProviderDocumentsAPI.prototype = {
    initialize: function() {
        this.depUiUtil = new global.DocumentExternalProviderUIUtils();
        this.depUtil = new global.DocumentExternalProviderUtils();
        this.docManagerUtil = new global.DocumentObjectManager();
        this.mpUtil = new global.MultiProviderDocumentsUtil();
        this.constants = new global.DocumentExternalProviderConstantUtil();
    },

    /**
     * Uploads a document attachment to the specified external provider.
     *
     * @param {Object} inputs - Parameters for the upload operation.
     * @param {string} inputs.providerDetailSysId - Sys ID of the provider detail record.
     * @param {string} inputs.documentSysId - Sys ID of the document to upload.
     * @param {string} inputs.folderPath - Path of the folder in the provider.
     * @param {string} inputs.folderURL - URL of the folder in the provider.
     * @param {boolean} inputs.removeVersionFile - Whether to delete the local attachment after upload.
     * @returns {object} result object with status and details of the operation.
     */

    uploadAttachmentToProvider: function(inputs) {
        var providerDetailSysId = inputs.providerDetailSysId;
        var documentSysId = inputs.documentSysId;
        var shouldDeleteAttachment = inputs.removeVersionFile;
        var docGR;
        var providerGR;
        try {
            providerGR = this.depUtil.validateProvider(providerDetailSysId);
            docGR = this._getDocumentRecord(documentSysId);
        } catch (err) {
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        var providerName = providerGR.getValue(this.constants.tableColumns.PROVIDER_NAME);
        inputs.providerName = providerName;

        if (docGR.canWrite()) {
            var versionSysID = docGR.getValue("default_version");
            var attachment = new GlideSysAttachment().getAttachments(this.constants.tables.DOCUMENT_VERSION, versionSysID);
            if (!attachment.next()) {
                return this._createResponse(this.constants.status.ERROR, this.constants.emptyVersionAttachmentMessage, this.constants.statusCode.BAD_REQUEST);
            }
            inputs.attachmentSysId = attachment.sys_id;
            if (providerName.toLowerCase() == this.constants.googleDrive.PROVIDER_NAME) {
                inputs.fileName = attachment.file_name;
            }
            var extension = this._getMultiProviderExtensionPoint(providerName);
            if (!extension)
                return this._createResponse(this.constants.status.ERROR, this.constants.noExtensionConfiguredMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var providerInputs = extension.processInputs(inputs, this.constants.operations.UPLOAD);
            var result = extension.upload(providerInputs);

            var resultMap = {};
            resultMap.providerDetailSysId = providerDetailSysId;
            resultMap.providerName = providerName;
            resultMap.folderPath = inputs.folderPath;
            resultMap.folderURL = inputs.folderURL;
            resultMap.documentSysID = documentSysId;

            // For failure or error case, we are not saving the external document attributes in ds_document.
            if (result.status.toLowerCase() == this.constants.status.SUCCESS) {
                resultMap.mpDocumentSysID = result.document_sysid;
                resultMap.externalFileURL = result.file_url;
                this.depUiUtil.updateDocumentWithExternalDetails(docGR, resultMap);
                this.depUiUtil.updateVersionWithExternalDetails(versionSysID, resultMap.mpDocumentSysID);
                if (shouldDeleteAttachment) {
                    var offloadResult = this.depUiUtil.offloadAttachment(docGR, versionSysID, inputs.attachmentSysId);
                    result.offloadFileStatus = offloadResult.offloadFileStatus;
                }
            }
            return result;
        } else
            return this._createResponse(this.constants.status.ERROR, this.constants.noPermissionMessage, this.constants.statusCode.FORBIDDEN);
    },

    /**
     * Updates an existing document attachment for the specified external provider.
     *
     * @param {Object} inputs - Parameters for the update operation.
     * @param {string} inputs.documentSysId - Sys ID of the document to update.
     * @param {boolean} inputs.removeVersionFile - Whether to delete the local attachment after update.
     * @returns {object} result object with status and details of the operation.
     */

    updateAttachmentToProvider: function(inputs) {
        var documentSysId = inputs.documentSysId;
        var shouldDeleteAttachment = inputs.removeVersionFile;
        var docGR;
        try {
            docGR = this._getDocumentRecord(documentSysId);
        } catch (err) {
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        if (docGR.canWrite()) {
            // Getting the default version of the document.
            var versionSysID = docGR.getValue("default_version");
            var attachment = new GlideSysAttachment().getAttachments(this.constants.tables.DOCUMENT_VERSION, versionSysID);
            if (!attachment.next()) {
                return this._createResponse(this.constants.status.ERROR, this.constants.emptyVersionAttachmentMessage, this.constants.statusCode.BAD_REQUEST);
            }
            inputs.attachmentSysId = attachment.getValue(this.constants.tableColumns.SYS_ID);
            var providerDetailSysId = docGR.getValue(this.constants.tableColumns.EXTERNAL_PROVIDER);
            var mpDocumentSysID = docGR.getValue(this.constants.tableColumns.MP_DOCUMENT);
            var providerGR;
            try {
                providerGR = this.depUtil.validateProvider(providerDetailSysId);
            } catch (err) {
                return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
            }
            var providerName = providerGR.getValue(this.constants.tableColumns.PROVIDER_NAME);
            inputs.mpDocumentSysID = mpDocumentSysID;

            var extension = this._getMultiProviderExtensionPoint(providerName);
            if (!extension)
                return this._createResponse(this.constants.status.ERROR, this.constants.noExtensionConfiguredMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var providerInputs = extension.processInputs(inputs, this.constants.operations.UPDATE);
            var result = extension.update(providerInputs);
            this.depUiUtil.handleErrors(result);
            // For failure or error case, we are not saving the external document attributes in ds_document.
            if (result.status.toLowerCase() == this.constants.status.SUCCESS) {
                this.depUiUtil.updateVersionWithExternalDetails(versionSysID, mpDocumentSysID);
                if (shouldDeleteAttachment) {
                    var offloadResult = this.depUiUtil.offloadAttachment(docGR, versionSysID, inputs.attachmentSysId);
                    result.offloadFileStatus = offloadResult.offloadFileStatus;
                }
            }
            return result;
        } else
            return this._createResponse(this.constants.status.ERROR, this.constants.noPermissionMessage, this.constants.statusCode.FORBIDDEN);

    },

    /**
     * Synchronize the latest version of a document from the external provider to the local system.
     *
     * @param {string} documentSysId - The Sys ID of the document to synchronize.
     * @returns {object} Result object containing the status and details of the sync operation.
     */

    syncVersionFromProvider: function(documentSysId) {
        var docGR;
        try {
            docGR = this._getDocumentRecord(documentSysId);
        } catch (err) {
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        var providerDetailSysId = docGR.getValue(this.constants.tableColumns.EXTERNAL_PROVIDER);
        var mpDocumentSysID = docGR.getValue(this.constants.tableColumns.MP_DOCUMENT);
        var providerDetails = this.depUtil.getProviderDetails(providerDetailSysId);
        var providerName = providerDetails.provider_name;

        var extension = this._getMultiProviderExtensionPoint(providerName);
        if (!extension)
            return this._createResponse(this.constants.status.ERROR, this.constants.noExtensionConfiguredMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

        var inputs = {
            providerDetailSysID: providerDetailSysId,
            mpDocumentSysID: mpDocumentSysID
        };
        var providerInputs = extension.processInputs(inputs, this.constants.operations.SYNC);
        var result = extension.syncDown(providerInputs);
        var filterMap = {
            document: documentSysId
        };
        var latestDSVersion = this.docManagerUtil.getLatestRecord(this.constants.tables.DOCUMENT_VERSION, this.constants.tableColumns.SYS_CREATED_ON, filterMap);
        var docName = this.mpUtil.getDocumentName(mpDocumentSysID);

        if (!result.status || result.status.toLowerCase() !== this.constants.status.SUCCESS) {
            result.status = result.status || this.constants.status.ERROR;
            result.error_message = result.error_message || this.constants.syncProblemMessage;
            this.depUiUtil.handleErrors(result);
            return result;
        }
        if (!latestDSVersion) {
            result = this.depUiUtil.copyDocumentUtil(providerDetailSysId, providerName, documentSysId, docName, mpDocumentSysID);
            this.depUiUtil.handleErrors(result);
            return result;
        }
        return this._handleLatestDSVersion(latestDSVersion, mpDocumentSysID, providerDetailSysId, providerName, documentSysId, docName, result);

    },

    /**
     * Attaches a document from an external provider to a ServiceNow document.
     *
     * @param {Object} inputs - Parameters for the attach operation.
     * @param {string} inputs.providerId - Sys ID of the provider detail record.
     * @param {string} inputs.providerItemId - ID of the item in the provider.
     * @param {string} inputs.documentId - Sys ID of the document to attach to.
     * @param {string} inputs.documentName - Name of the document.
     * @param {Object} inputs.sourceAttributes - Additional attributes.
     * @param {boolean} inputs.linkOnly - Whether to create only a link.
     * @returns {object} result object with status and details of the operation.
     */
    attachFromProvider: function(inputs) {
        var attachExtensionPoint = "global.MultiProviderAttachDocumentAPI";
        var providerDetailSysId = inputs.providerId;
        var providerItemId = inputs.providerItemId;
        var documentSysId = inputs.documentId;
        var documentName = inputs.documentName;
        var sourceAttributes = inputs.sourceAttributes;
        var linkOnly = (inputs.linkOnly === true || inputs.linkOnly === "true");
        var providerGR;
        var docGR;

        if (!providerItemId)
            return this._createResponse(this.constants.status.ERROR, this.constants.emptyProviderItemIdMessage, this.constants.statusCode.BAD_REQUEST);
        if (!documentName)
            return this._createResponse(this.constants.status.ERROR, this.constants.emptyDocumentNameMessage, this.constants.statusCode.BAD_REQUEST);
        try {
            providerGR = this.depUtil.validateProvider(providerDetailSysId);
            docGR = this._getDocumentRecord(documentSysId);
        } catch (err) {
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        if (docGR.getValue("external") && docGR.getValue("mp_document")) {
            var errMessage = "The document with Id " + documentSysId + " is already attached with external document having URL: " + docGR.getValue("external_file_url");
            return this._createResponse(this.constants.status.ERROR, errMessage, this.constants.statusCode.CONFLICT);
        }

        var providerName = providerGR.getValue(this.constants.tableColumns.PROVIDER_NAME);
        var extension = this._getExtensionPoint(providerName, attachExtensionPoint);
        if (!extension)
            return this._createResponse(this.constants.status.ERROR, this.constants.noExtensionConfiguredMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

        if (!docGR.canWrite())
            return this._createResponse(this.constants.status.ERROR, this.constants.noPermissionMessage, this.constants.statusCode.FORBIDDEN);

        var verGR = new GlideRecord(this.constants.tables.DOCUMENT_VERSION);
        verGR.initialize();
        verGR.document = documentSysId;
        var versionSysID = verGR.insert();
        if (!versionSysID)
            return this._createResponse(this.constants.status.ERROR, this.constants.failedVersionCreationMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

        inputs.versionSysID = versionSysID;
        inputs.targetTableName = this.constants.tables.DOCUMENT_VERSION;

        var providerInputs;
        try {
            providerInputs = extension.processInputs(inputs);
        } catch (err) {
            this.depUiUtil.deleteVersionUtil(inputs);
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        var result = extension.attach(providerInputs);
        result.versionSysID = versionSysID;


        var resultMap = {};
        resultMap.providerDetailSysId = providerDetailSysId;
        resultMap.providerName = providerName;
        resultMap.documentSysID = documentSysId;
        resultMap.fileName = documentName;
        resultMap.externalFileURL = result.file_url;

        // update document with external details
        if (result.status && result.status.toLowerCase() == this.constants.status.SUCCESS) {
            resultMap.mpDocumentSysID = result.document_sys_id;
            resultMap.externalFileURL = result.file_url;
            this.depUiUtil.updateDocumentWithExternalDetails(docGR, resultMap);
            // Only update version if not a link-only operation
            if (!linkOnly) {
                this.depUiUtil.updateVersionWithExternalDetails(versionSysID, resultMap.mpDocumentSysID);
            }
            // Google Drive sync disabled logic
            if (providerName.toLowerCase() == this.constants.googleDrive.PROVIDER_NAME && linkOnly) {
                if (result.file_type && result.file_type.toLowerCase() === this.constants.googleDrive.FILE_TYPE && result.mime_type !== this.constants.googleDrive.MIME_TYPE) {
                    docGR.setValue('sync_disabled', true);
                    docGR.update();
                }
            }
        }
        // Delete version if either: Operation was not successful OR It's a link-only operation
        if (!(result.status && result.status.toLowerCase() == this.constants.status.SUCCESS) || linkOnly)
            this.depUiUtil.deleteVersionUtil(result);

        this.depUiUtil.handleErrors(result);
        return result;
    },

    /**
     * Retrieves paginated files and folders from a specific provider.
     * 
     * @param {Object} inputs - Input parameters object.
     * @param {string} inputs.providerDetailSysId - The sys_id of the provider detail record.
     * @param {number} inputs.pageSize - Number of items to return per page.
     * @param {string} inputs.pageToken - Token for pagination (used to get next page of results).
     * @param {string} inputs.folderId - ID of the folder to list contents from.
     * @param {string} inputs.searchQuery - Optional query string to search for files/folders.
     * @returns {Object} Result object with status, files array, count, and optional pageToken or error message.
     */
    getPaginatedFilesAndFolders: function(inputs) {
        var filesAndFolderExtensionPoint = "global.MultiProviderFilesAndFoldersAPI";
        var providerGR;
        try {
            providerGR = this.depUtil.validateProvider(inputs.providerDetailSysId);
        } catch (err) {
            return this._createResponse(this.constants.status.ERROR, err.message, err.status_code);
        }
        var providerName = providerGR.getValue(this.constants.tableColumns.PROVIDER_NAME);
        var extension = this._getExtensionPoint(providerName, filesAndFolderExtensionPoint);
        if (!extension)
            return this._createResponse(this.constants.status.ERROR, this.constants.noExtensionConfiguredMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

        var providerInputs = extension.processInputs(inputs);
        var result = extension.getIncrementalFilesAndFolders(inputs.providerDetailSysId, providerInputs);
        var processedResult = extension.parseActionResult(result);
        return processedResult;
    },

    /**
     * Handle latestDSVersion logic
     */
    _handleLatestDSVersion: function(latestDSVersion, mpDocumentSysID, providerDetailSysId, providerName, documentSysId, docName, result) {
        var mpLatestVersion = this.mpUtil.getLatestVersion(mpDocumentSysID);
        var latestDSVersionGR = new GlideRecordSecure(this.constants.tables.DOCUMENT_VERSION);
        if (latestDSVersion && latestDSVersionGR.get(latestDSVersion)) {
            var latestDSMPVersion = latestDSVersionGR.getValue(this.constants.tableColumns.MP_DOCUMENT_VERSION);
            var latestVersionExists = new GlideRecordSecure(this.constants.tables.DOCUMENT_VERSION);
            latestVersionExists.addQuery(this.constants.tableColumns.MP_DOCUMENT_VERSION, mpLatestVersion.getUniqueValue());
            latestVersionExists.query();
            var latestVersionSynced = false;
            if (latestVersionExists.next()) latestVersionSynced = true;
            if ((!latestVersionSynced && !latestDSMPVersion) || (latestDSMPVersion != mpLatestVersion.getUniqueValue() && !(mpLatestVersion.getValue("attachment")))) {
                result = this.depUiUtil.copyDocumentUtil(providerDetailSysId, providerName, documentSysId, docName, mpDocumentSysID);
            }
        }
        this.depUiUtil.handleErrors(result);
        return result;
    },
    /**
     * Retrieves the extension point implementation for a given provider and extension point name.
     * @param {string} providerName - The name of the provider to match.
     * @param {string} extensionPointName - The name of the extension point to search for.
     * @returns {Object|null} The matching extension point implementation, or null if not found.
     */
    _getExtensionPoint: function(providerName, extensionPointName) {
        var ext;
        var eps = new GlideScriptedExtensionPoint().getExtensions(extensionPointName);
        for (var i = 0; i < eps.length; i++) {
            try {
                ext = eps[i];
                if (ext.appliesFor(providerName)) {
                    ext.initialize();
                    return ext;
                }
            } catch (e) {
                gs.error("Error while filtering extension point:" + e);
            }
        }
        return null;
    },

    _getMultiProviderExtensionPoint: function(providerName) {
        var ext;
        var eps = new GlideScriptedExtensionPoint().getExtensions(this.constants.EXTENSION_POINT_NAME);
        for (var i = 0; i < eps.length; i++) {
            try {
                ext = eps[i];
                if (ext.appliesFor(providerName)) {
                    ext.initialize();
                    return ext;
                }
            } catch (e) {
                gs.error("Error while filtering extension point:" + e);
            }
        }
        return null;
    },

    /**
     * Get document GlideRecord or throw error with appropriate status code
     * @param {String} documentSysId - Document sys_id to retrieve
     * @returns {GlideRecord} documentGR if valid
     */
    _getDocumentRecord: function(documentSysId) {
        if (!documentSysId) {
            var missingIdError = new Error(this.constants.emptyDocumentSysIdMessage);
            missingIdError.status_code = this.constants.statusCode.BAD_REQUEST;
            throw missingIdError;
        }
        var documentGR = new GlideRecord(this.constants.tables.DOCUMENT);
        if (!documentGR.get(documentSysId)) {
            var invalidIdError = new Error(this.constants.invalidDocumentSysIdMessage);
            invalidIdError.status_code = this.constants.statusCode.NOT_FOUND;
            throw invalidIdError;
        }
        return documentGR;
    },

    /**
     * Creates a response object with the given status and message.
     *
     * @param {String} status - The status of the response.
     * @param {String} [message] - The message of the response.
     * @returns {Object} The response object.
     */
    _createResponse: function(status, message, statusCode) {
        return {
            status: status,
            error_message: message || "",
            status_code: statusCode || this.constants.statusCode.INTERNAL_SERVER_ERROR
        };
    },

    /**
     * Returns a valid HTTP status code based on input or defaults.
     * @param {String|Number} status_code - The candidate status code (may be string or number)
     * @param {String} status - The status string (e.g., "success", "error")
     * @returns {Number} A valid HTTP status code
     */
    getValidStatusCode: function(status_code, status) {
        var code = Number(status_code);
        if (!isNaN(code) && code >= 100 && code < 600) {
            return code;
        }
        if (typeof status === "string" && status.toLowerCase() === "success") {
            return 200;
        }
        return 500;
    },
    type: 'MultiProviderDocumentsAPI'
};
