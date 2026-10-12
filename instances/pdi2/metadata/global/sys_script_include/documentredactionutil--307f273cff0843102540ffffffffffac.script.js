var DocumentRedactionUtil = Class.create();
DocumentRedactionUtil.prototype = {
    FILE_TYPE_DOCUMENT: 'document',
    FILE_TYPE_ATTACHMENT: 'attachment',
    STATUS_SUCCESS: 'success',
    STATUS_FAILED: 'failed',
    REDACTION_TYPE_AGENT: 'agent',
    REDACTION_TYPE_MANUAL: 'manual',

    initialize: function() {},

    /**
     * Saves a redacted document version.
     * Draft: replaces existing attachment. Published: creates new version.
     *
     * @param {string} originalAttachmentSysId - sys_id of the original sys_attachment on the version
     * @param {string} redactedAttachmentSysId - sys_id of the redacted(temp) sys_attachment
     * @returns {{ success: boolean, error: string= }}
     */
    saveRedactedDocumentVersion: function(originalAttachmentSysId, redactedAttachmentSysId) {
        if (!originalAttachmentSysId || !redactedAttachmentSysId) {
            return {
                success: false,
                error: 'Both originalAttachmentSysId and redactedAttachmentSysId are required'
            };
        }
        return this._saveAndLog(originalAttachmentSysId, redactedAttachmentSysId, this.FILE_TYPE_DOCUMENT);
    },

    /**
     * Deletes a redacted attachment from sys_attachment table.
     * Used when user discards the redacted document.
     *
     * @param {string} redactedAttachmentSysId - sys_id of the redacted (temp) sys_attachment to delete
     * @returns {{ success: boolean, error: string= }}
     */
    deleteRedactedAttachment: function(redactedAttachmentSysId) {
        if (!redactedAttachmentSysId) {
            return {
                success: false,
                error: 'redactedAttachmentSysId is required'
            };
        }
        var gr = new GlideRecordSecure('sys_attachment');
        if (gr.get(redactedAttachmentSysId)) {
            if (!gr.deleteRecord()) {
                return {
                    success: false,
                    error: 'Failed to delete attachment: ' + redactedAttachmentSysId
                };
            }
            return {
                success: true
            };
        } else {
            return {
                success: false,
                error: 'Attachment not found: ' + redactedAttachmentSysId
            };
        }
    },

    /**
     * Saves a redacted attachment by re-linking it to 
     * the original attachment's parent record.
     *
     * @param {string} originalAttachmentSysId - sys_id of the original sys_attachment
     * @param {string} redactedAttachmentSysId - sys_id of the redacted (temp) sys_attachment
     * @returns {{ success: boolean, error: string= }}
     */
    saveRedactedAttachment: function(originalAttachmentSysId, redactedAttachmentSysId) {
        if (!originalAttachmentSysId || !redactedAttachmentSysId) {
            return {
                success: false,
                error: 'Both originalAttachmentSysId and redactedAttachmentSysId are required'
            };
        }
        return this._saveAndLog(originalAttachmentSysId, redactedAttachmentSysId, this.FILE_TYPE_ATTACHMENT);
    },

    /**
     * Creates a redaction audit log entry in ds_redaction_audit_log.
     * Used by both the manual path (saveredacteddocument REST) and agent path.
     *
     * @param {object} params
     * @param {string} params.sourceSysId      - sys_attachment sys_id of the original file
     * @param {string} [params.redactedSysId]  - sys_attachment sys_id of the redacted file
     * @param {string} params.fileType         - 'document' or 'attachment'
     * @param {string} params.fileName         - original file name
     * @param {string} params.status           - 'success' or 'failed'
     * @param {string} params.redactionType    - 'agent' or 'manual'
     * @param {string} [params.errorMessage]   - populated on failure
     * @returns {string|null} sys_id of the inserted audit log record, or null on failure
     */
    createRedactionAuditLog: function(params) {
        if (!params || !params.sourceSysId || !params.fileType || !params.fileName || !params.status || !params.redactionType) {
            gs.warn('[DocumentRedactionUtil] Missing required parameters for audit log');
            return null;
        }
        var auditLog = new GlideRecordSecure('ds_redaction_audit_log');
        auditLog.initialize();
        auditLog.source_sys_id = params.sourceSysId;
        auditLog.redacted_sys_id = params.redactedSysId || '';
        auditLog.file_type = params.fileType;
        auditLog.file_name = params.fileName;
        auditLog.status = params.status;
        auditLog.triggered_by = gs.getUserID();
        auditLog.redaction_type = params.redactionType;
        if (params.errorMessage) {
            auditLog.error_message = params.errorMessage;
        }
        var result = auditLog.insert();
        if (!result) {
            gs.warn('[DocumentRedactionUtil] Failed to insert audit log for source: ' + params.sourceSysId);
            return null;
        }
        return result;
    },

    getActiveRedactionCodes: function() {
        var redactionCodes = [];
        var gr = new GlideRecordSecure('ds_redaction_code');
        gr.addActiveQuery();
        gr.query();

        while (gr.next()) {
            redactionCodes.push({
                code: gr.getValue('code'),
                description: gr.getValue('description')
            });
        }
        return redactionCodes;
    },

    /**
     * Core save-and-log flow shared by saveRedactedDocumentVersion
     * and saveRedactedAttachment.
     */
    _saveAndLog: function(originalAttachmentSysId, redactedAttachmentSysId, fileType) {
        var attachmentRecord = new GlideRecord('sys_attachment');
        if (!attachmentRecord.get(originalAttachmentSysId)) {
            this._tryLog({
                sourceSysId: originalAttachmentSysId,
                redactedSysId: redactedAttachmentSysId,
                fileType: fileType,
                fileName: '',
                status: this.STATUS_FAILED,
                redactionType: this.REDACTION_TYPE_AGENT,
                errorMessage: 'Original attachment not found: ' + originalAttachmentSysId
            });
            return {
                success: false,
                error: 'Original attachment not found'
            };
        }

        var parentTable = attachmentRecord.getValue('table_name');
        var parentSysId = attachmentRecord.getValue('table_sys_id');
        var fileName = attachmentRecord.getValue('file_name');

        try {
            if (fileType === this.FILE_TYPE_DOCUMENT) {
                this._handleDocumentVersionRedaction(parentSysId, redactedAttachmentSysId, fileName);
            } else {
                this._handleAttachmentRedaction(parentTable, parentSysId, redactedAttachmentSysId, fileName);
            }

            this._tryLog({
                sourceSysId: originalAttachmentSysId,
                redactedSysId: redactedAttachmentSysId,
                fileType: fileType,
                fileName: fileName,
                status: this.STATUS_SUCCESS,
                redactionType: this.REDACTION_TYPE_AGENT
            });
            return {
                success: true
            };
        } catch (e) {
            var errorMsg = e.message || String(e);
            this._tryLog({
                sourceSysId: originalAttachmentSysId,
                redactedSysId: redactedAttachmentSysId,
                fileType: fileType,
                fileName: fileName,
                status: this.STATUS_FAILED,
                redactionType: this.REDACTION_TYPE_AGENT,
                errorMessage: errorMsg
            });
            return {
                success: false,
                error: errorMsg
            };
        }
    },

    /**
     * Wraps createRedactionAuditLog so a logging failure never
     * masks the outcome of the save operation.
     */
    _tryLog: function(params) {
        try {
            this.createRedactionAuditLog(params);
        } catch (e) {
            gs.error('[DocumentRedactionUtil] Failed to create audit log: ' + (e.message || String(e)));
        }
    },

    /**
     * Handles redaction for ds_document_version records.
     * Draft: replaces existing attachment. Published: creates new version.
     * ROLLBACK GUARDS:
     * - Draft: if save or original attachment deletion fails, completely delete the redacted attachment
     * - Published: if attachment save fails, delete both redacted attachment AND orphaned version
     */
    _handleDocumentVersionRedaction: function(versionSysId, redactedAttachmentSysId, originalFileName) {
        var targetVersionSysId = versionSysId;
        var versionRecord = new GlideRecordSecure('ds_document_version');
        if (!versionRecord.get(targetVersionSysId)) {
            throw new Error('Document version not found: ' + targetVersionSysId);
        }

        var attachment = new GlideSysAttachment();
        var attachmentRecord = attachment.getAttachments('ds_document_version', targetVersionSysId);
        if (!attachmentRecord.next()) {
            throw new Error('No attachment found for version: ' + targetVersionSysId);
        }

        var versionState = versionRecord.getValue('version_state');
        if (versionState === 'draft') {
            // Draft: save redacted first, then delete original
            try {
                this._saveAttachment('ds_document_version', targetVersionSysId, redactedAttachmentSysId, originalFileName);
                attachment.deleteAttachment(attachmentRecord.getValue('sys_id'));
            } catch (e) {
                // ROLLBACK: delete the redacted attachment on any failure
                try {
                    var rollback = new GlideRecordSecure('sys_attachment');
                    if (rollback.get(redactedAttachmentSysId)) {
                        rollback.deleteRecord();
                    }
                } catch (rollbackError) {
                    gs.error('[DocumentRedactionUtil] Rollback failed: ' + (rollbackError.message || String(rollbackError)));
                }
                throw e;
            }
        } else if (versionState === 'published') {
            // Published: create new version, then save attachment with full rollback
            var newVersionRecord = new GlideRecordSecure('ds_document_version');
            newVersionRecord.initialize();
            newVersionRecord.document = versionRecord.getValue('document');
            targetVersionSysId = newVersionRecord.insert();
            if (!targetVersionSysId) {
                throw new Error('Failed to create new document version');
            }
            try {
                this._saveAttachment('ds_document_version', targetVersionSysId, redactedAttachmentSysId, originalFileName);
            } catch (e) {
                // ROLLBACK: delete redacted attachment first, then the orphaned version
                try {
                    var rollbackAttachment = new GlideRecordSecure('sys_attachment');
                    if (rollbackAttachment.get(redactedAttachmentSysId)) {
                        rollbackAttachment.deleteRecord();
                    }
                } catch (delAttachError) {
                    gs.error('[DocumentRedactionUtil] Rollback failed: ' + (delAttachError.message || String(delAttachError)));
                }

                try {
                    var rollbackVersion = new GlideRecordSecure('ds_document_version');
                    if (rollbackVersion.get(targetVersionSysId)) {
                        rollbackVersion.deleteRecord();
                    }
                } catch (delVersionError) {
                    gs.error('[DocumentRedactionUtil] Rollback failed: ' + (delVersionError.message || String(delVersionError)));
                }

                throw e;
            }
        } else {
            throw new Error('Invalid version state: ' + versionState);
        }
    },

    /**
     * Handles redaction for sys_attachment records.
     * Re-links the temp redacted attachment to the parent record.
     * Original attachment is preserved.
     */
    _handleAttachmentRedaction: function(parentTable, parentSysId, redactedAttachmentSysId, originalFileName) {
        var parentRecord = new GlideRecordSecure(parentTable);
        if (!parentRecord.get(parentSysId)) {
            throw new Error('Parent record not found.');
        }

        if (!parentRecord.canWrite()) {
            throw new Error('You do not have write access to this record.');
        }

        this._saveAttachment(parentTable, parentSysId, redactedAttachmentSysId, originalFileName);
    },

    /**
     * Re-links a temp attachment to the target record and renames it
     * with the _redacted suffix.
     */
    _saveAttachment: function(tableName, tableSysId, attachmentSysId, originalFileName) {
        var attachmentRecord = new GlideRecord('sys_attachment');
        if (!attachmentRecord.get(attachmentSysId)) {
            throw new Error('Attachment not found.');
        }
        attachmentRecord.table_name = tableName;
        attachmentRecord.table_sys_id = tableSysId;
        var originalFileNameWithoutExtension = originalFileName.replace(/\.pdf$/, '');
        var newFileName = originalFileNameWithoutExtension;
        var redactedCount = 0;
        var match = newFileName.match(/_redacted\((\d+)\)$/);
        if (match) {
            redactedCount = parseInt(match[1]) + 1;
            newFileName = newFileName.replace(/_redacted\(\d+\)$/, '');
        } else if (newFileName.endsWith('_redacted')) {
            redactedCount = 1;
            newFileName = newFileName.replace(/_redacted$/, '');
        }
        if (redactedCount > 0) {
            attachmentRecord.file_name = newFileName + '_redacted(' + redactedCount + ').pdf';
        } else {
            attachmentRecord.file_name = newFileName + '_redacted.pdf';
        }

        attachmentRecord.update();
    },

    type: 'DocumentRedactionUtil'
};
