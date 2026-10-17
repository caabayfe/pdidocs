(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    if (!request.body || !request.body.data) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage('Request body is missing or malformed.');
    }
    var versionSysId = request.body.data.version_sys_id;
    var attachmentSysId = request.body.data.attachment_sys_id;
    var parentTable = request.body.data.parent_table;
    var parentSysId = request.body.data.parent_sys_id;
    var originalAttachmentSysId = request.body.data.original_attachment_sys_id;

    if (!attachmentSysId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage('attachment_sys_id is required.');
    }

    if (versionSysId) {
        handleDocumentVersionRedaction(versionSysId, attachmentSysId, response);
    } else if (parentTable && parentSysId) {
        handleAttachmentRedaction(parentTable, parentSysId, attachmentSysId, originalAttachmentSysId, response);
    } else {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage('Either version_sys_id or both parent_table and parent_sys_id are required.');
    }

})(request, response);

/**
 * Handles redaction for ds_document_version records.
 * Draft: replaces existing attachment. Published: creates new version.
 */
function handleDocumentVersionRedaction(versionSysId, attachmentSysId, response) {
    var targetVersionSysId = versionSysId;
    var versionRecord = new GlideRecordSecure('ds_document_version');
    if (!versionRecord.get(targetVersionSysId)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(404)
            .setMessage('Document version not found.');
    }

    versionRecord.query();
    if (versionRecord.next()) {
        var attachment = new GlideSysAttachment();
        var attachmentRecord = attachment.getAttachments('ds_document_version', targetVersionSysId);
        if (attachmentRecord.next()) {
            var attachmentName = attachmentRecord.getValue('file_name');
        } else {
            gs.warn('No records found for table_sys_id: ' + targetVersionSysId + ' and table_name: ds_document_version');
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage('No attachment found for document version.');
        }

        var redactionUtil = new DocumentRedactionUtil();
        var logResult;
        var originalAttachmentSysId = attachmentRecord.getValue('sys_id');
        var versionState = versionRecord.getValue('version_state');
        if (versionState === 'draft') {
            if (!versionRecord.canWrite()) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(403)
                    .setMessage('Do not have permission to save this attachment.');
            }
            try {
                // Update existing draft version
                saveAttachment('ds_document_version', targetVersionSysId, attachmentSysId, attachmentName);
                attachment.deleteAttachment(originalAttachmentSysId);
                logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_DOCUMENT, attachmentName, redactionUtil.STATUS_SUCCESS);
            } catch (e) {
                logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_DOCUMENT, attachmentName, redactionUtil.STATUS_FAILED, e.message || String(e));
                throw e;
            }
        } else if (versionState === 'published') {
            try {
                // Create a new version
                var newVersionRecord = new GlideRecordSecure('ds_document_version');
                newVersionRecord.document = versionRecord.getValue('document');
                targetVersionSysId = newVersionRecord.insert();
                if (!targetVersionSysId) {
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage('Failed to create new document version.');
                }
                saveAttachment('ds_document_version', targetVersionSysId, attachmentSysId, attachmentName);
                logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_DOCUMENT, attachmentName, redactionUtil.STATUS_SUCCESS);
            } catch (e) {
                logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_DOCUMENT, attachmentName, redactionUtil.STATUS_FAILED, e.message || String(e));
                throw e;
            }
        } else {
            response.setStatus(404);
            response.setBody({
                error: 'Invalid version state',
                state: versionState
            });
            return;
        }
        response.setStatus(200);
        response.setBody({
            version_sys_id: targetVersionSysId,
            state: versionState
        });
    } else {
        response.setStatus(404);
    }
}



/**
 * Handles redaction for sys_attachment records.
 * Re-links the temp redacted attachment to the parent record.
 * Original attachment is preserved.
 */
function handleAttachmentRedaction(parentTable, parentSysId, attachmentSysId, originalAttachmentSysId, response) {
    var parentRecord = new GlideRecordSecure(parentTable);
    if (!parentRecord.get(parentSysId)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(404)
            .setMessage('Parent record not found.');
    }

    if (!parentRecord.canWrite()) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage('You do not have write access to this record.');
    }

    // Get original attachment's file name for proper renaming
    var attachmentName = '';
    if (originalAttachmentSysId) {
        var originalAttachment = new GlideRecord('sys_attachment');
        if (originalAttachment.get(originalAttachmentSysId)) {
            attachmentName = originalAttachment.getValue('file_name');
        }
    }

    // Fallback: use temp attachment's name if original not found
    if (!attachmentName) {
        var warnMsg = originalAttachmentSysId ?
            'Original attachment not found (sys_id: ' + originalAttachmentSysId + ')' :
            'original_attachment_sys_id not provided';
        gs.warn(warnMsg + ' Using temp attachment name as fallback.');
        var tempAttachment = new GlideRecord('sys_attachment');
        if (!tempAttachment.get(attachmentSysId)) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage('Attachment not found.');
        }
        attachmentName = tempAttachment.getValue('file_name');
    }

    var redactionUtil = new DocumentRedactionUtil();
    try {
        saveAttachment(parentTable, parentSysId, attachmentSysId, attachmentName);
        logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_ATTACHMENT, attachmentName, redactionUtil.STATUS_SUCCESS);
    } catch (e) {
        logRedactionAudit(originalAttachmentSysId, attachmentSysId, redactionUtil.FILE_TYPE_ATTACHMENT, attachmentName, redactionUtil.STATUS_FAILED, e.message || String(e));
        throw e;
    }

    response.setStatus(200);
    response.setBody({
        attachment_sys_id: attachmentSysId
    });
}

/**
 * Re-links an attachment to the given table/record and appends _redacted suffix.
 * Includes session owner check for security.
 */
function saveAttachment(tableName, tableSysId, attachmentSysId, attachmentName) {
    var attachmentRecord = new GlideRecord('sys_attachment');
    if (!attachmentRecord.get(attachmentSysId)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(404)
            .setMessage('Attachment not found.');
    }

    // Security check to verify if the owner of the record matches the current session owner
    var currentUser = gs.getUser();
    var sessionOwner = currentUser.getName();
    var recordOwner = attachmentRecord.getValue('sys_created_by');

    if (recordOwner != sessionOwner) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage('Do not have permission to save this attachment.');
    }
    attachmentRecord.table_name = tableName;
    attachmentRecord.table_sys_id = tableSysId;
    var attachmentNameWithoutExtension = attachmentName.replace(/\.pdf$/, '');
    var newAttachmentName = attachmentNameWithoutExtension;
    var redactedCount = 0;
    var match = newAttachmentName.match(/_redacted\((\d+)\)$/);
    if (match) {
        redactedCount = parseInt(match[1]) + 1;
        newAttachmentName = newAttachmentName.replace(/_redacted\(\d+\)$/, '');
    } else if (newAttachmentName.endsWith('_redacted')) {
        redactedCount = 1;
        newAttachmentName = newAttachmentName.replace(/_redacted$/, '');
    }
    if (redactedCount > 0) {
        attachmentRecord.file_name = newAttachmentName + '_redacted(' + redactedCount + ').pdf';
    } else {
        attachmentRecord.file_name = newAttachmentName + '_redacted.pdf';
    }

    attachmentRecord.update();
}

/**
 * Helper to create audit log and handle logging failures.
 * 
 * @param {string} sourceSysId - Original attachment sys_id
 * @param {string} redactedSysId - Redacted attachment sys_id
 * @param {string} fileType - redactionUtil.FILE_TYPE_DOCUMENT or redactionUtil.FILE_TYPE_ATTACHMENT
 * @param {string} fileName - File name
 * @param {string} status - redactionUtil.STATUS_SUCCESS or redactionUtil.STATUS_FAILED
 * @param {string} [errorMessage] - Error message for failed status
 */
function logRedactionAudit(sourceSysId, redactedSysId, fileType, fileName, status, errorMessage) {
    var redactionUtil = new DocumentRedactionUtil();
    var logResult = redactionUtil.createRedactionAuditLog({
        sourceSysId: sourceSysId,
        redactedSysId: redactedSysId,
        fileType: fileType,
        fileName: fileName,
        status: status,
        redactionType: redactionUtil.REDACTION_TYPE_MANUAL,
        errorMessage: errorMessage
    });

    if (!logResult) {
        gs.error('[saveredacteddocument] Failed to create audit log for ' + status + ' redaction: ' + sourceSysId);
    }
}
