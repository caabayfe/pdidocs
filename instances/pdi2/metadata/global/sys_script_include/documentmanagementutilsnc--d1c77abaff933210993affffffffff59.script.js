var DocumentManagementUtilSNC = Class.create();
DocumentManagementUtilSNC.prototype = {
    initialize: function() {
        this.constants = new global.DocumentManagementConstantUtil();
        this.docManagerUtil = new global.DocumentObjectManager();
    },

    /**
     * Converts an attachment to a document record and links it to the target record.
     * Owner is automatically determined from attachment's sys_created_by field.
     * If sys_created_by user is not found in sys_user table, current logged-in user is used as owner.
     * 
     * IMPORTANT: This method validates that the current logged-in user will be the document owner.
     * If the current user differs from the attachment's sys_created_by user (and sys_created_by exists in sys_user),
     * an error will be returned to prevent creating orphaned documents that cannot be linked to the target record.
     * For creating standalone documents with different owner, use createDocFromAttachment instead.
     * 
     * @param {String} attachmentSysId - Attachment sys_id to convert
     * @param {String} [docName] - Optional: Document name (defaults to attachment's file_name)
     * @returns {Object} {status, documentSysId, versionSysId, documentName, attachmentSysId, fileName, fileSize, createdTime, mimeType, statusCode} on success or {status, errorMessage, statusCode} on error
     */

    createAndLinkDocFromAttachment: function(attachmentSysId, docName) {
        var result = null;
        try {
            var attachmentData = this.docManagerUtil.getAndValidateAttachment(attachmentSysId, null, docName);

            var currentUserSysId = gs.getUserID();
            if (attachmentData.doc.owner !== currentUserSysId) {
                throw this.docManagerUtil.createErrorResponse(this.constants.ownerMismatchMessage, this.constants.statusCode.FORBIDDEN);
            }

            var recordAccessResult = this.docManagerUtil.validateRecordAccess(attachmentData.tableName, attachmentData.targetRecordSysId);
            if (!recordAccessResult.valid)
                throw this.docManagerUtil.createErrorResponse(recordAccessResult.error, this.constants.statusCode.FORBIDDEN);

            result = this.docManagerUtil.createAndLinkDocument(
                attachmentData.doc,
                attachmentData.tableName,
                attachmentData.targetRecordSysId
            );

            if (!result)
                throw this.docManagerUtil.createErrorResponse(this.constants.failedToCreateAndLinkDocumentMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            this.docManagerUtil.moveAttachmentToVersion(attachmentData.attachmentGR, result.version);

            var documentReferenceSysId = this.docManagerUtil.getLatestRecordSysId(this.constants.tables.DOCUMENT_REFERENCES, {
                document: result.document_sys_id,
                target_record: attachmentData.targetRecordSysId,
                table_name: attachmentData.tableName
            });
            var createdTime = this.docManagerUtil.getFieldValue(this.constants.tables.DOCUMENT, result.document_sys_id, this.constants.tableColumns.SYS_CREATED_ON);

            return {
                status: this.constants.status.SUCCESS,
                documentSysId: result.document_sys_id,
                versionSysId: result.version,
                documentName: result.file_name,
                attachmentSysId: attachmentData.attachmentGR.getUniqueValue(),
                fileName: attachmentData.attachmentGR.getValue(this.constants.tableColumns.FILE_NAME),
                fileSize: attachmentData.attachmentGR.getValue(this.constants.tableColumns.SIZE_BYTES),
                createdTime: createdTime,
                mimeType: attachmentData.attachmentGR.getValue(this.constants.tableColumns.CONTENT_TYPE),
                documentReferenceSysId: documentReferenceSysId,
                statusCode: this.constants.statusCode.OK
            };
        } catch (err) {
            if (result && result.document_sys_id)
                this.docManagerUtil.deleteDocumentV2(result.document_sys_id);
            gs.error('Error creating document from attachment with reference ' + attachmentSysId + ': ' + err);
            return this._createResponse(this.constants.status.ERROR, err.message || err.toString(), err.statusCode || this.constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    },

    /**
     * Converts an attachment to a document record without referencing to the target record.
     * If owner is provided, it will be used. Otherwise, owner is determined from attachment's sys_created_by field.
     * If sys_created_by user is not found in sys_user table, current logged-in user is used as owner.
     *
     * @param {String} attachmentSysId - Attachment sys_id to convert
     * @param {String} [owner] - Optional: User sys_id who will own the document
     * @param {String} [docName] - Optional: Document name (defaults to attachment's file_name)
     * @returns {Object} {status, documentSysId, versionSysId, documentName, attachmentSysId, fileName, fileSize, createdTime, mimeType, statusCode} on success or {status, errorMessage, statusCode} on error
     */
    createDocFromAttachment: function(attachmentSysId, owner, docName) {
        var result = null;
        try {
            var attachmentData = this.docManagerUtil.getAndValidateAttachment(attachmentSysId, owner, docName);

            result = this.docManagerUtil.createDocumentWithVersion(
                attachmentData.doc.file_name,
                null,
                attachmentData.doc.owner
            );

            if (!result)
                throw this.docManagerUtil.createErrorResponse(this.constants.failedDocumentCreationMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            this.docManagerUtil.moveAttachmentToVersion(attachmentData.attachmentGR, result.version);
            var createdTime = this.docManagerUtil.getFieldValue(this.constants.tables.DOCUMENT, result.document_sys_id, this.constants.tableColumns.SYS_CREATED_ON);

            return {
                status: this.constants.status.SUCCESS,
                documentSysId: result.document_sys_id,
                versionSysId: result.version,
                documentName: result.file_name,
                attachmentSysId: attachmentData.attachmentGR.getUniqueValue(),
                fileName: attachmentData.attachmentGR.getValue(this.constants.tableColumns.FILE_NAME),
                fileSize: attachmentData.attachmentGR.getValue(this.constants.tableColumns.SIZE_BYTES),
                createdTime: createdTime,
                mimeType: attachmentData.attachmentGR.getValue(this.constants.tableColumns.CONTENT_TYPE),
                statusCode: this.constants.statusCode.OK
            };
        } catch (err) {
            if (result && result.document_sys_id)
                this.docManagerUtil.deleteDocumentV2(result.document_sys_id);
            gs.error('Error creating document from attachment without reference ' + attachmentSysId + ': ' + err);
            return this._createResponse(this.constants.status.ERROR, err.message || err.toString(), err.statusCode || this.constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    },


    /**
     * Creates a document with version and attaches a file to the version record and also links document to target record..
     * 
     * @param {GlideScriptableInputStream} inputStream - File input stream
     * @param {String} contentType - MIME type (e.g., 'application/pdf')
     * @param {String} fileName - File name with extension (e.g., 'document.pdf')
     * @param {String} targetRecordSysId - Target record sys_id
     * @param {String} targetTableName - Target table name
     * @param {String} [documentName] - Display name for document (optional, defaults to fileName)
     * @returns {Object} {status, documentSysId, versionSysId, attachmentSysId, fileName, fileSize, createdTime, mimeType, statusCode} on success or {status, errorMessage, statusCode} on error
     * 
     * @example
     * var result = createAndLinkDocumentFromStream(inputStream, 'application/pdf', 'contract.pdf', recordSysId, 'incident', null);
     */
    createAndLinkDocumentFromStream: function(inputStream, contentType, fileName, targetRecordSysId, targetTableName, documentName) {
        var result = null;
        try {
            this._validateInputParameters(inputStream, contentType, fileName);

            documentName = this.docManagerUtil.getDocumentName(documentName, fileName);
            var recordAccess = this.docManagerUtil.validateRecordAccess(targetTableName, targetRecordSysId);
            if (!recordAccess.valid)
                throw this.docManagerUtil.createErrorResponse(recordAccess.error, this.constants.statusCode.FORBIDDEN);

            result = this.docManagerUtil.createAndLinkDocument({
                    file_name: documentName,
                },
                targetTableName,
                targetRecordSysId
            );

            if (!result)
                throw this.docManagerUtil.createErrorResponse(this.constants.failedToCreateAndLinkDocumentMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var attachmentSysId = this.docManagerUtil.attachFileToVersion(result.version, fileName, contentType, inputStream);

            var attachmentGR = new GlideRecord(this.constants.tables.SYS_ATTACHMENT);
            if (!attachmentGR.get(attachmentSysId))
                throw this.docManagerUtil.createErrorResponse('Failed to retrieve attachment metadata', this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var documentReferenceSysId = this.docManagerUtil.getLatestRecordSysId(this.constants.tables.DOCUMENT_REFERENCES, {
                document: result.document_sys_id,
                target_record: targetRecordSysId,
                table_name: targetTableName
            });
            var createdTime = this.docManagerUtil.getFieldValue(this.constants.tables.DOCUMENT, result.document_sys_id, this.constants.tableColumns.SYS_CREATED_ON);

            return {
                status: this.constants.status.SUCCESS,
                documentSysId: result.document_sys_id,
                versionSysId: result.version,
                attachmentSysId: attachmentSysId,
                fileName: attachmentGR.getValue(this.constants.tableColumns.FILE_NAME),
                fileSize: attachmentGR.getValue(this.constants.tableColumns.SIZE_BYTES),
                createdTime: createdTime,
                mimeType: contentType,
                documentReferenceSysId: documentReferenceSysId,
                statusCode: this.constants.statusCode.OK
            };
        } catch (err) {
            if (result && result.document_sys_id)
                this.docManagerUtil.deleteDocumentV2(result.document_sys_id);
            gs.error('Error in creating document and version in createDocumentWithLink: ' + err);
            return this._createResponse(this.constants.status.ERROR, err.message || err.toString(), err.statusCode || this.constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    },

    /**
     * Creates a document with version and attaches a file to the version record.. 
     * 
     * @param {GlideScriptableInputStream} inputStream - File input stream
     * @param {String} contentType - MIME type (e.g., 'application/pdf')
     * @param {String} fileName - File name with extension (e.g., 'document.pdf')
     * @param {String} [documentName] - Display name for document (optional, defaults to fileName)
     * @returns {Object} {status, documentSysId, versionSysId, attachmentSysId, fileName, fileSize, createdTime, mimeType, statusCode} on success or {status, errorMessage, statusCode} on error
     * 
     * @example
     * var result = createDocumentFromStream(inputStream, 'application/pdf', 'contract.pdf', null);
     */
    createDocumentFromStream: function(inputStream, contentType, fileName, documentName) {
        var result = null;
        try {
            this._validateInputParameters(inputStream, contentType, fileName);

            documentName = this.docManagerUtil.getDocumentName(documentName, fileName);

            result = this.docManagerUtil.createDocumentWithVersion(documentName, null, null);
            if (!result)
                throw this.docManagerUtil.createErrorResponse(this.constants.failedDocumentCreationMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var attachmentSysId = this.docManagerUtil.attachFileToVersion(result.version, fileName, contentType, inputStream);

            var attachmentGR = new GlideRecord(this.constants.tables.SYS_ATTACHMENT);
            if (!attachmentGR.get(attachmentSysId))
                throw this.docManagerUtil.createErrorResponse('Failed to retrieve attachment metadata', this.constants.statusCode.INTERNAL_SERVER_ERROR);

            var createdTime = this.docManagerUtil.getFieldValue(this.constants.tables.DOCUMENT, result.document_sys_id, this.constants.tableColumns.SYS_CREATED_ON);

            return {
                status: this.constants.status.SUCCESS,
                documentSysId: result.document_sys_id,
                versionSysId: result.version,
                attachmentSysId: attachmentSysId,
                fileName: attachmentGR.getValue(this.constants.tableColumns.FILE_NAME),
                fileSize: attachmentGR.getValue(this.constants.tableColumns.SIZE_BYTES),
                createdTime: createdTime,
                mimeType: contentType,
                statusCode: this.constants.statusCode.OK
            };
        } catch (err) {
            if (result && result.document_sys_id)
                this.docManagerUtil.deleteDocumentV2(result.document_sys_id);
            gs.error('Error in creating document and version in createDocument: ' + err);
            return this._createResponse(this.constants.status.ERROR, err.message || err.toString(), err.statusCode || this.constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    },


    /**
     * Validates common input parameters for document creation.
     * Throws an error if validation fails.
     *
     * @param {GlideScriptableInputStream} inputStream - File input stream
     * @param {String} contentType - MIME type
     * @param {String} fileName - File name with extension
     * @throws {Error} Error with statusCode property if validation fails
     */
    _validateInputParameters: function(inputStream, contentType, fileName) {
        if (!inputStream)
            throw this.docManagerUtil.createErrorResponse(this.constants.inputStreamRequiredMessage, this.constants.statusCode.BAD_REQUEST);

        if (!(inputStream instanceof GlideScriptableInputStream))
            throw this.docManagerUtil.createErrorResponse(this.constants.inputStreamTypeMessage, this.constants.statusCode.BAD_REQUEST);

        if (!contentType || typeof contentType !== 'string' || contentType.trim() === '')
            throw this.docManagerUtil.createErrorResponse(this.constants.contentTypeRequiredMessage, this.constants.statusCode.BAD_REQUEST);

        if (!fileName || typeof fileName !== 'string' || fileName.trim() === '')
            throw this.docManagerUtil.createErrorResponse(this.constants.fileNameRequiredMessage, this.constants.statusCode.BAD_REQUEST);

        if (fileName.lastIndexOf('.') === -1 || fileName.lastIndexOf('.') === fileName.length - 1)
            throw this.docManagerUtil.createErrorResponse(this.constants.fileNameExtensionMessage, this.constants.statusCode.BAD_REQUEST);
    },

    /**
     * Creates a response object with the given status, message, and HTTP status code.
     * Used internally to convert caught errors into return objects.
     *
     * @param {String} status - The status of the response (e.g., 'success', 'error').
     * @param {String} [message] - The error message.
     * @param {Number} statusCode - The HTTP status code (e.g., 400, 403, 500).
     * @returns {Object} Response object with {status, errorMessage, statusCode}.
     */
    _createResponse: function(status, message, statusCode) {
        return {
            status: status,
            errorMessage: message || "",
            statusCode: statusCode
        };
    },

    type: 'DocumentManagementUtilSNC'
};
