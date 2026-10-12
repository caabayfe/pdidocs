var DocumentObjectManager = Class.create();
DocumentObjectManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function() {
        global.AbstractAjaxProcessor.prototype.initialize.apply(this, arguments); // this is required to call the base class initialize method. 
        this.constants = new global.DocumentManagementConstantUtil();
    },

    proceedWithDeleteFromForm: function() {
        var documentSysId = this.getParameter('sysparm_document_sys_id');
        this.deleteDocument(documentSysId);
        return true;
    },
    proceedWithDeleteFromList: function() {
        var documentSysIds = this.getParameter('sysparm_document_sys_id_list');
        var documentSysIdList = documentSysIds.split(',');
        for (var i = 0; i < documentSysIdList.length; i++) {
            if (documentSysIdList[i] == null || documentSysIdList[i] == '')
                continue;
            this.deleteDocument(documentSysIdList[i]);
        }
        return true;
    },
    proceedWithRemoveFromList: function(documentSysIds, parentTableSysId, parentTableName) {
        var sysIds = documentSysIds || this.getParameter('sysparm_document_sys_id_list');
        var documentSysIdList = sysIds.split(',');
        var tableSysId = parentTableSysId || this.getParameter('sysparm_table_sys_id');
        var tableName = parentTableName || this.getParameter('sysparm_table_name');

        for (var i = 0; i < documentSysIdList.length; i++) {
            if (documentSysIdList[i] == null || documentSysIdList[i] == '')
                continue;
            var referenceRecord = new GlideRecordSecure('ds_document_references');
            var parent_sysid = new GlideRecordSecure(tableName);
            parent_sysid.get(tableSysId);
            if (parent_sysid.canWrite()) {
                referenceRecord.addQuery('target_record', parent_sysid.getUniqueValue());
                referenceRecord.addQuery('document', documentSysIdList[i]);
                referenceRecord.query();
                if (referenceRecord.next()) {
                    referenceRecord.deleteRecord();
                }
            }
        }
    },
    downloadDocuments: function() {
        var documentSysIds = this.getParameter('sysparm_obj_list');
        var documentSysIdList = documentSysIds.split(',');
        var attachmentSysIds = "";
        var countSuccess = 0;
        var sm = new GCFSampleMap();
        for (var i = 0; i < documentSysIdList.length; i++) {
            var documentSysId = documentSysIdList[i];
            if (documentSysId == null || documentSysId == '')
                continue;
            var documentRecord = new GlideRecordSecure('ds_document');
            documentRecord.get(documentSysId);
            if (documentRecord.canRead()) {
                var versionRecordSysId = documentRecord.getValue('default_version');
                gs.info('default version record ' + versionRecordSysId);
                if (!versionRecordSysId || 0 === versionRecordSysId.length) {
                    gs.error('Default Version does not exist for document ' + documentSysId);
                    continue;
                }
                var versionRecord = new GlideRecordSecure('ds_document_version');
                if (versionRecord.get(versionRecordSysId)) {
                    if (versionRecord.getAttribute('type') == 'url') {
                        gs.error('Attachment type is URL, you cant download.');
                        continue;
                    }
                    var grSysAtt = new GlideRecordSecure('sys_attachment');
                    grSysAtt.addQuery('table_name', 'ds_document_version');
                    grSysAtt.addQuery('table_sys_id', versionRecord.getUniqueValue());
                    grSysAtt.query();
                    if (grSysAtt.next())
                        attachmentSysIds += "," + grSysAtt.getUniqueValue();
                }
            }
            countSuccess++;
        }
        if (!attachmentSysIds || 0 === attachmentSysIds.length || (/^\s*$/).test(attachmentSysIds)) {
            gs.error('Attachments does not exist for the selected documents.');
            return null;
        }
        sm.put('downloadCount', countSuccess);
        GCFCollector.recordUsageEvent('documents', 'document_management', 'document_download', sm);
        return attachmentSysIds.substring(1);
    },
    downloadDocumentVersions: function() {
        var versionSysIds = this.getParameter('sysparm_obj_list');
        var versionSysIdList = versionSysIds.split(',');
        var attachmentSysIds = "";
        var countSuccess = 0;
        var sm = new GCFSampleMap();

        for (var i = 0; i < versionSysIdList.length; i++) {
            var versionSysId = versionSysIdList[i];
            if (versionSysId == null || versionSysId == '')
                continue;
            var versionRecord = new GlideRecordSecure('ds_document_version');
            versionRecord.get(versionSysId);
            if (versionRecord.canRead()) {
                if (versionRecord.getAttribute('type') == 'url') {
                    gs.error('Attachment type is URL, you cant download.');
                    continue;
                }
                var grSysAtt = new GlideRecordSecure('sys_attachment');
                grSysAtt.addQuery('table_name', 'ds_document_version');
                grSysAtt.addQuery('table_sys_id', versionRecord.getUniqueValue());
                grSysAtt.query();
                if (grSysAtt.next())
                    attachmentSysIds += "," + grSysAtt.getUniqueValue();
            }
            countSuccess++;
        }
        if (!attachmentSysIds || 0 === attachmentSysIds.length || (/^\s*$/).test(attachmentSysIds)) {
            gs.error('Attachments does not exist or it is not accessible for the selected document versions.');
            return null;
        }
        sm.put('downloadCount', countSuccess);
        GCFCollector.recordUsageEvent('documents', 'document_management', 'document_download', sm);
        return attachmentSysIds.substring(1);
    },
    deleteDocumentFromClient: function() {
        var documentSysId = this.getParameter('sysparm_document_sys_id');
        this.deleteDocument(documentSysId);
    },
    deleteDocument: function(documentSysId) {
        var documentRecord = new GlideRecordSecure('ds_document');
        documentRecord.get(documentSysId);
        if (documentRecord.canDelete()) {
            var versionRecord = new GlideRecordSecure('ds_document_version');
            versionRecord.addQuery('document', documentRecord.getUniqueValue());
            versionRecord.query();
            while (versionRecord.next()) {
                if (!versionRecord.canDelete())
                    continue;

                var attachmentRecord = versionRecord.attachment.getRefRecord();
                if (attachmentRecord.getUniqueValue()) {
                    if (attachmentRecord.canDelete())
                        attachmentRecord.deleteRecord();
                }
                versionRecord.deleteRecord();
            }

            var referenceRecord = new GlideRecordSecure('ds_document_references');
            referenceRecord.addQuery('document', documentRecord.getUniqueValue());
            referenceRecord.query();
            referenceRecord.deleteMultiple();

            var listEntryRecord = new GlideRecordSecure('ds_document_list_entry');
            listEntryRecord.addQuery('document', documentRecord.getUniqueValue());
            listEntryRecord.query();
            listEntryRecord.deleteMultiple();

            documentRecord.deleteRecord();
        }
    },

    /**
     * This is an optimized version of the deleteDocument method that only deletes the document record itself.
     * The cascading deletion of related records (versions, attachments, references, list entries) is handled 
     * automatically by database cascade delete rules, making this method more efficient.
     * 
     * Use this method for future implementations instead of deleteDocument() as it is optimized 
     * and performs better by leveraging database-level cascade deletes.
     * 
     **/

    deleteDocumentV2: function(docSysId) {
        var documentRecord = new GlideRecordSecure(this.constants.tables.DOCUMENT);
        if (documentRecord.get(docSysId)) {
            documentRecord.deleteRecord();
        }
    },

    insertVersion: function() {
        var documentSysId = this.getParameter('sysparm_document_sys_id');
        var gr = new GlideRecordSecure('ds_document');
        gr.get(documentSysId);
        if (!gr.canWrite()) {
            return null;
        }
        var type = this.getParameter('sysparm_document_type');
        var documentVersionSysId = this.getParameter('sysparm_document_version_sys_id');
        var urlToInsert = this.getParameter('sysparam_url_value');
        var versionNotes = this.getParameter('sysparm_version_notes');

        var versionGR = new GlideRecordSecure('ds_document_version');
        if (documentVersionSysId) {
            versionGR.setNewGuidValue(documentVersionSysId);
        }
        versionGR.document = documentSysId;
        versionGR.type = type;
        versionGR.notes = versionNotes;
        if (type == 'url') {
            versionGR.url = urlToInsert;
        }
        if (versionGR.canCreate()) {
            return versionGR.insert();
        }
        return null;
    },

    updateVersion: function() {
        var documentVersionSysId = this.getParameter('sysparm_document_version_sys_id');
        var gr = new GlideRecordSecure('ds_document_version');

        if (!gr.get(documentVersionSysId)) {
            return null;
        }
        var versionNotes = this.getParameter('sysparm_version_notes');
        gr.notes = versionNotes;
        if (gr.update()) {
            return true;
        }
        return null;
    },
    insertReference: function() {
        var documentSysId = this.getParameter('sysparm_document_sys_id');
        var gr = new GlideRecordSecure('ds_document');
        gr.get(documentSysId);

        if (!gr.canRead()) {
            gs.error("Document Management: Current user does not have access to " + documentSysId);
            return null;
        }

        var referenceGR = new GlideRecordSecure('ds_document_references');
        var tableName = this.getParameter('sysparm_table_name');
        var targetRecord = this.getParameter('sysparm_target_record');

        var targetGR = new GlideRecordSecure(tableName);
        if (!targetGR.get(targetRecord) || !targetGR.canWrite()) {
            gs.error("Document Management: Current user does not have write access to recordID: {0} in table: {1}.", targetRecord, tableName);
            return null;
        }

        referenceGR.document = documentSysId;
        referenceGR.target_record = targetRecord;
        referenceGR.table_name = tableName;

        if (referenceGR.canCreate()) {
            return referenceGR.insert();
        }

        gs.error("Document Management: Current user does not have access to create references in ds_document_references table");
        return null;
    },

    getLatestRecord: function(tableName, dateFieldName, filterFieldMap) {
        var gr = new GlideRecord(tableName);
        for (var fieldName in filterFieldMap) {
            if (filterFieldMap.hasOwnProperty(fieldName)) {
                var value = filterFieldMap[fieldName];
                if (value) {
                    gr.addQuery(fieldName, value);
                }
            }
        }
        gr.orderByDesc(dateFieldName);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            var latestRecordSysID = gr.getValue('sys_id');
        }
        return latestRecordSysID;
    },
    createDocumentForTargetRecord: function(targetTableName, targetTableSysId, documentAttributes) {
        var t = new GlideRecordSecure(targetTableName);
        if (!t.get(targetTableSysId))
            throw "Either (" + targetTableName + ", " + targetTableSysId + ") is not valid or is not accesible";
        var doc = new GlideRecord("ds_document");
        doc.initialize();
        var docId = doc.insert();
        var hasAttr = false;
        for (var attr in documentAttributes) {
            hasAttr = true;
            if (attr == 'external_provider_attrs')
                doc.setValue(attr, JSON.stringify(documentAttributes[attr]));
            else
                doc.setValue(attr, documentAttributes[attr]);
        }
        if (hasAttr)
            doc.update();
        this.insertReferenceForTargetRecord(docId, targetTableName, targetTableSysId);
        return docId;
    },
    insertReferenceForTargetRecord: function(documentSysId, targetTableName, targetTableSysId) {
        var gr = new GlideRecordSecure('ds_document');
        gr.get(documentSysId);
        if (!gr.canRead())
            throw "Document Management: Current user does not have access to " + documentSysId;
        var recordAccess = this.validateRecordAccess(targetTableName, targetTableSysId);
        if (!recordAccess.valid)
            throw recordAccess.error;

        var referenceGR = new GlideRecordSecure('ds_document_references');
        referenceGR.document = documentSysId;
        referenceGR.target_record = targetTableSysId;
        referenceGR.table_name = targetTableName;
        if (referenceGR.canCreate())
            return referenceGR.insert();
        throw "Document Management: Current user does not have access to create references in ds_document_references table";
    },
    getColumnValue: function() {
        var sysId = this.getParameter('sysparm_sysId');
        var tableName = this.getParameter('sysparm_tableName');
        var columnName = this.getParameter('sysparm_columnName');
        var gr = new GlideRecordSecure(tableName);
        if (gr.get(sysId)) {
            return gr.getValue(columnName);
        }
    },
    checkAndUpdateSharePermission: function(documentSysId) {
        var result = {
            success: false,
            message: '',
            shareDisabled: null
        };
        try {
            var allowedValues = gs.getProperty('com.snc.documents.permalink.allowed_classifications', '');
            var allowedList = allowedValues.split(',').map(function(item) {
                return item.trim();
            });
            var doc = new GlideRecord('ds_document');
            if (!doc.get(documentSysId)) {
                result.message = 'Document not found with sys_id: ' + documentSysId;
                return result;
            }
            var classification = doc.getValue('classification');
            var isAllowed = !classification || allowedList.indexOf(classification) !== -1;
            result.success = true;
            result.shareDisabled = !isAllowed;
            result.message = isAllowed ?
                'Classification is allowed for sharing. Sharing is enabled.' :
                'Classification is not allowed for sharing. Sharing is disabled.';

        } catch (e) {
            result.message = 'Unexpected error: ' + e.message;
        }
        return result;
    },
    /**
     * Creates a document along with its initial version and links it to a target record
     */
    createAndLinkDocument: function(doc, targetTableName, targetTableSysId) {
        var docSysId = null;
        try {
            var name = doc.file_name;
            var owner = doc.owner;
            var docInfo = this.createDocumentWithVersion(name, '', owner);
            if (!docInfo) {
                gs.error('Error in creating document or version');
                return null;
            }
            docSysId = docInfo.document_sys_id;
            var verSysId = docInfo.version;
            this.insertReferenceForTargetRecord(docSysId, targetTableName, targetTableSysId);
            return {
                file_name: name,
                document_sys_id: docSysId,
                version: verSysId
            };
        } catch (e) {
            if (docSysId)
                this.deleteDocumentV2(docSysId);
            gs.error('Error creating and linking document to target record: ' + e);
            return null;
        }
    },
    createDocumentUnderFolder: function(doc, folderSysId) {
        try {
            var name = doc.file_name;
            var docInfo = this.createDocumentWithVersion(name, folderSysId);
            if (!docInfo) {
                gs.error('Error in creating document under folder');
                return null;
            }
            var docSysId = docInfo.document_sys_id;
            var verSysId = docInfo.version;
            return {
                file_name: name,
                document_sys_id: docSysId,
                version: verSysId
            };
        } catch (e) {
            gs.error('Error creating document under folder: ' + e);
            return null;
        }
    },
    /**
     * Creates a document, with optional folder assignment.
     *
     * Notes:
     * - This method does NOT validate folder existence or permissions.
     * - Ensure folder validations are handled in the calling function before passing folderSysId.
     */
    createDocument: function(name, folderSysId, owner) {
        try {
            var grDoc = new GlideRecordSecure('ds_document');
            grDoc.name = name;
            if (folderSysId)
                grDoc.parent_folder = folderSysId;
            if (owner)
                grDoc.owner = owner;
            return grDoc.insert();
        } catch (e) {
            gs.error('Error creating document record: ' + e);
            return null;
        }
    },
    /**
     * Creates a document version
     *
     * Notes:
     * - This method does NOT validate document existence or permissions.
     * - Ensure document validations are handled in the calling function before passing documentSysId.
     */
    createDocumentVersion: function(documentSysId) {
        try {
            var version = new GlideRecordSecure('ds_document_version');
            version.document = documentSysId;
            return version.insert();
        } catch (e) {
            gs.error('Error creating version record: ' + e);
            return null;
        }
    },
    createDocumentWithVersion: function(name, folderSysId, owner) {
        try {
            var docSysId = this.createDocument(name, folderSysId, owner);
            if (!docSysId) {
                gs.error('Failed to create document');
                return null;
            }
            var verSysId = this.createDocumentVersion(docSysId);
            if (!verSysId) {
                this.deleteDocumentV2(docSysId);
                gs.error('Failed to create version for document. Document deleted: ' + docSysId);
                return null;
            }
            return {
                file_name: name,
                document_sys_id: docSysId,
                version: verSysId,
            };
        } catch (e) {
            gs.error('Error creating document with version: ' + e);
            return null;
        }
    },
    validateRecordAccess: function(tableName, recordSysId) {
        var rec = new GlideRecordSecure(tableName);
        if (!rec.get(recordSysId)) {
            return {
                valid: false,
                error: 'Record not found with sys_id: ' + recordSysId + ' in table: ' + tableName
            };
        }
        if (!rec.canWrite()) {
            return {
                valid: false,
                error: 'Insufficient permissions to reference document in record ' + recordSysId + ' in table ' + tableName
            };
        }
        return {
            valid: true
        };
    },
    validateFolderAccess: function(folderSysId) {
        var folder = new GlideRecordSecure('ds_folder');
        if (!folder.get(folderSysId)) {
            return {
                valid: false,
                error: 'Folder not found with sys_id: ' + folderSysId
            };
        }
        if (!folder.canWrite()) {
            return {
                valid: false,
                error: 'Insufficient permissions to add document to folder ' + folderSysId
            };
        }
        return {
            valid: true
        };
    },
    validateDocumentObject: function(doc) {
        if (!doc.file_name) {
            return {
                valid: false,
                error: 'file_name is required'
            };
        }
        return {
            valid: true
        };
    },
    /**
     * Retrieves and validates attachment, prepares metadata for document creation.
     * If owner is provided, it will be used. Otherwise, owner is determined from attachment's sys_created_by field.
     * If sys_created_by user is not found in sys_user table, current logged-in user is used as owner.
     *
     * @param {String} attachmentSysId - Attachment sys_id
     * @param {String} owner - Optional owner sys_id
     * @param {String} docName - Optional document name (defaults to attachment's file_name)
     * @returns {Object} Prepared data with attachmentGR, doc, tableName, targetRecordSysId
     * @throws {Error} If attachment is already converted to document version or if attachment not found
     */
    getAndValidateAttachment: function(attachmentSysId, owner, docName) {
        var attachmentGR = this._getAttachmentRecord(attachmentSysId);

        if (attachmentGR.getValue(this.constants.tableColumns.TABLE_NAME) === this.constants.tables.DOCUMENT_VERSION)
            throw this.createErrorResponse(this.constants.attachmentAlreadyConvertedMessage, this.constants.statusCode.BAD_REQUEST);

        var createdByUser = attachmentGR.getValue(this.constants.tableColumns.CREATED_BY);
        var documentOwner = this._getOwnerForDocument(owner, createdByUser);
        var documentName = (docName && docName.trim()) || attachmentGR.getValue(this.constants.tableColumns.FILE_NAME);

        return {
            attachmentGR: attachmentGR,
            doc: {
                file_name: documentName,
                owner: documentOwner
            },
            tableName: attachmentGR.getValue(this.constants.tableColumns.TABLE_NAME),
            targetRecordSysId: attachmentGR.getValue(this.constants.tableColumns.TABLE_SYS_ID)
        };
    },
    /**
     * Updates attachment record to point to document version.
     * Updates the attachment's table_name to ds_document_version and table_sys_id to the version sys_id.
     *
     * @param {GlideRecord} attachmentGR - Attachment record
     * @param {String} versionSysId - Document version sys_id
     * @throws {Error} If attachment update fails
     */
    moveAttachmentToVersion: function(attachmentGR, versionSysId) {
        attachmentGR.setValue(this.constants.tableColumns.TABLE_NAME, this.constants.tables.DOCUMENT_VERSION);
        attachmentGR.setValue(this.constants.tableColumns.TABLE_SYS_ID, versionSysId);
        if (!attachmentGR.update())
            throw this.createErrorResponse(this.constants.failedToMoveAttachmentMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);
    },
    /**
     * Retrieves the attachment GlideRecord with validation.
     *
     * @param {String} attachmentSysID - Sys_id of the attachment
     * @returns {GlideRecord} Attachment GlideRecord object
     * @throws {Error} If sys_id is empty or invalid
     */
    _getAttachmentRecord: function(attachmentSysID) {
        if (!attachmentSysID || (typeof attachmentSysID === 'string' && attachmentSysID.trim() === ''))
            throw this.createErrorResponse(this.constants.emptySysIdMessage, this.constants.statusCode.BAD_REQUEST);

        var attachmentGR = new GlideRecord(this.constants.tables.SYS_ATTACHMENT);
        if (!attachmentGR.get(attachmentSysID))
            throw this.createErrorResponse(this.constants.invalidSysIdMessage, this.constants.statusCode.NOT_FOUND);
        return attachmentGR;
    },
    /**
     * Validates owner by checking existence in sys_user table.
     * If owner parameter is provided, validates it as sys_id.
     * Otherwise, attempts to find user by sys_created_by value (user_name) in sys_user table.
     * If sys_created_by user not found, falls back to current logged-in user as owner.
     *
     * @param {String} owner - Optional owner sys_id passed by caller
     * @param {String} createdByUser - User name from attachment's sys_created_by field
     * @returns {String} Valid owner sys_id (provided owner, sys_created_by user, or current user)
     * @throws {Error} If provided owner sys_id is invalid or not found in sys_user table
     */
    _getOwnerForDocument: function(owner, createdByUser) {
        if (owner) {
            var ownerGR = new GlideRecord(this.constants.tables.SYS_USER);
            if (!ownerGR.get(owner))
                throw this.createErrorResponse(this.constants.invalidOwnerProvidedMessage + ' "' + owner + '"', this.constants.statusCode.BAD_REQUEST);
            return owner;
        }

        var userGR = new GlideRecord(this.constants.tables.SYS_USER);
        userGR.addQuery(this.constants.tableColumns.USER_NAME, createdByUser);
        userGR.setLimit(1);
        userGR.query();
        if (userGR.next())
            return userGR.getValue(this.constants.tableColumns.SYS_ID);
        var currentUserSysId = gs.getUserID();
        gs.info('sys_created_by user "' + createdByUser + '" not found in sys_user table. Using current user as owner: ' + currentUserSysId);
        return currentUserSysId;
    },
    /**
     * Returns documentName if provided and valid, otherwise returns fileName as fallback.
     *
     * @param {String} documentName - Optional document name (can be null/undefined/empty)
     * @param {String} fileName - File name to use as fallback
     * @returns {String} Document name to use
     */
    getDocumentName: function(documentName, fileName) {
        if (!documentName || typeof documentName !== 'string' || documentName.trim() === '')
            return fileName;
        return documentName;
    },
    /**
     * Attaches a file to a document version record.
     *
     * @param {String} versionSysId - Document version sys_id
     * @param {String} fileName - File name with extension
     * @param {String} contentType - MIME type
     * @param {GlideScriptableInputStream} inputStream - File input stream
     * @returns {String} Attachment sys_id
     * @throws {Error} If version record not found or file attachment fails
     */
    attachFileToVersion: function(versionSysId, fileName, contentType, inputStream) {
        var versionGr = new GlideRecordSecure(this.constants.tables.DOCUMENT_VERSION);
        if (!versionGr.get(versionSysId))
            throw this.createErrorResponse(this.constants.failedToRetrieveVersionMessage, this.constants.statusCode.NOT_FOUND);

        var sysAttachment = new GlideSysAttachment();
        var attachmentSysId = sysAttachment.writeContentStream(versionGr, fileName, contentType, inputStream);
        if (!attachmentSysId)
            throw this.createErrorResponse(this.constants.failedToAttachFileMessage, this.constants.statusCode.INTERNAL_SERVER_ERROR);
        return attachmentSysId;
    },
    /**
     * Get a specific field value from a record.
     * 
     * @param {String} tableName - Table name to query
     * @param {String} recordSysId - Record sys_id
     * @param {String} fieldName - Field name to retrieve
     * @returns {String} Field value, or empty string if record not found
     * 
     * @example
     * var createdTime = getFieldValue('ds_document', docSysId, 'sys_created_on');
     */
    getFieldValue: function(tableName, recordSysId, fieldName) {
        var gr = new GlideRecordSecure(tableName);
        if (gr.get(recordSysId)) {
            return gr.getValue(fieldName);
        }
        return '';
    },
    /**
     * Generic method to get the sys_id of the latest record based on filters.
     * 
     * @param {String} tableName - Table name to query
     * @param {Object} filters - Object with field-value pairs for query filters
     * @param {String} [orderByField='sys_created_on'] - Field to order by (defaults to sys_created_on)
     * @returns {String} sys_id of the latest record, or empty string if not found
     * 
     * @example
     * var refSysId = getLatestRecordSysId('ds_document_references', {
     *     document: docSysId,
     *     target_record: recordSysId,
     *     table_name: tableName
     * });
     */
    getLatestRecordSysId: function(tableName, filters, orderByField) {
        var gr = new GlideRecordSecure(tableName);
        for (var fieldName in filters) {
            gr.addQuery(fieldName, filters[fieldName]);
        }
        gr.orderByDesc(orderByField || this.constants.tableColumns.SYS_CREATED_ON);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getUniqueValue() : '';
    },
    /**
     * Get attachment details from a document version.
     * Returns empty strings for all fields if version not found or has no attachment.
     * 
     * @param {String} versionSysId - Document version sys_id
     * @returns {Object} Attachment details object with properties:
     *   - attachmentSysId {String}: Attachment sys_id or empty string
     *   - fileName {String}: File name or empty string
     *   - fileSize {String}: File size in bytes or empty string
     *   - mimeType {String}: MIME type or empty string
     */
    getAttachmentDetailsFromVersion: function(versionSysId) {
        var details = {
            attachmentSysId: '',
            fileName: '',
            fileSize: '',
            mimeType: ''
        };

        if (!versionSysId) return details;

        var attachGR = new GlideRecord(this.constants.tables.SYS_ATTACHMENT);
        attachGR.addQuery(this.constants.tableColumns.TABLE_NAME, this.constants.tables.DOCUMENT_VERSION);
        attachGR.addQuery(this.constants.tableColumns.TABLE_SYS_ID, versionSysId);
        attachGR.query();

        if (attachGR.next()) {
            details.attachmentSysId = attachGR.getUniqueValue();
            details.fileName = attachGR.getValue(this.constants.tableColumns.FILE_NAME);
            details.fileSize = attachGR.getValue(this.constants.tableColumns.SIZE_BYTES);
            details.mimeType = attachGR.getValue(this.constants.tableColumns.CONTENT_TYPE);
        }

        return details;
    },
    /**
     * Creates an Error object with HTTP status code attached.
     * 
     * @param {String} message - Error message
     * @param {Number} statusCode - HTTP status code
     * @returns {Error} Error object with statusCode property
     */
    createErrorResponse: function(message, statusCode) {
        var err = new Error(message);
        err.statusCode = statusCode;
        return err;
    },

    toString: function() {
        return 'DocumentObjectManager';
    },
});
