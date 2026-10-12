(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var multiProviderAPI = new global.MultiProviderDocumentsAPI();
    var documentManager = new global.DocumentObjectManager();

    try {
        var inputs = request.body.data;
        var providerId = request.pathParams.provider_id;
        var providerItemId = inputs.providerItemId;
        var documentId = inputs.documentId;
        var documentName = inputs.documentName;
        var targetTableName = inputs.targetTableName;
        var targetRecordSysId = inputs.targetRecordSysId;
        var folderSysId = inputs.folderSysId;
        var sourceAttributes = inputs.sourceAttributes;
        var linkOnly = inputs.linkOnly;

        var hasDocId = !!documentId;
        var hasTargetTableAndRecord = !!targetTableName && !!targetRecordSysId;
        var hasFolderId = !!folderSysId;
        var attachParams = {};
        var attachResult;

        if (!hasDocId && hasFolderId && hasTargetTableAndRecord)
            return sendErrorResponse(400, "Both folderSysId and targetTable/targetRecord provided. Please provide only one creation method.");

        if (hasDocId && hasFolderId && hasTargetTableAndRecord)
            return sendErrorResponse(400, "Invalid parameter combination: documentId, folderSysId, and targetTable/targetRecord cannot be used together. Provide only one.");

        if (hasDocId && (hasFolderId || hasTargetTableAndRecord))
            return sendErrorResponse(400, "Invalid parameter combination: When using documentId, do not include folderSysId or targetTable/targetRecord parameters.");

        if (hasDocId) {
            attachParams = setupAttachParams(documentId);
            attachResult = multiProviderAPI.attachFromProvider(attachParams);
            sendFormattedResponse(attachResult, documentId);
            return;
        }

        var documentAttributes = {
            name: documentName
        };
        var documentSysId;

        // Folder ID is provided (no document ID or target record)
        if (hasFolderId && !hasTargetTableAndRecord) {
            var folderGR = new GlideRecordSecure('ds_folder');
            if (!folderGR.get(folderSysId))
                return sendErrorResponse(404, "Specified folder does not exist: " + folderSysId);

            if (!folderGR.canWrite())
                return sendErrorResponse(403, "User does not have write permission on the specified folder.");

            // Create document under the folder
            documentSysId = documentManager.createDocument(documentName, folderSysId);
            if (!documentSysId)
                return sendErrorResponse(500, "Failed to create document in folder: " + folderSysId);
        }
        // Target table and record are provided (no document ID or folder ID)
        else if (hasTargetTableAndRecord) {
            var targetTableGR = new GlideRecordSecure(targetTableName);

            if (!targetTableGR.isValid())
                return sendErrorResponse(400, "Invalid table: " + targetTableName);

            if (!targetTableGR.get(targetRecordSysId))
                return sendErrorResponse(404, "Record not found: " + targetRecordSysId + " in table " + targetTableName);

            documentSysId = documentManager.createDocumentForTargetRecord(targetTableName, targetRecordSysId, documentAttributes);

            if (!documentSysId)
                return sendErrorResponse(500, "Failed to create document for target record");
        }
        else if (!hasDocId && !hasTargetTableAndRecord && !hasFolderId) {
            // Create a document without attaching to any record.
            documentSysId = documentManager.createDocument(documentAttributes.name);
            if (!documentSysId)
                return sendErrorResponse(500, "Failed to create document for target record");
        }

        attachParams = setupAttachParams(documentSysId);

        try {
            attachResult = multiProviderAPI.attachFromProvider(attachParams);
            if (!attachResult.status || attachResult.status.toLowerCase() !== "success") {
                documentManager.deleteDocument(documentSysId);
            }
            sendFormattedResponse(attachResult, documentSysId);
            return;
        } catch (err) {
            documentManager.deleteDocument(documentSysId);
            gs.error("Provider - Attach Item error (attach to new doc): " + err);
            return sendErrorResponse(500, "Unexpected server error");
        }
    } catch (err) {
        gs.error("Provider - Attach Item " + err);
        return sendErrorResponse(500, "Unexpected server error");
    }

    function sendFormattedResponse(attachResult, docSysId) {
        var statusCode = multiProviderAPI.getValidStatusCode(attachResult.status_code, attachResult.status);
        var responseBody;

        if (attachResult.status && attachResult.status.toLowerCase() == "success") {
            responseBody = {
                status: attachResult.status.toLowerCase(),
                mpDocumentSysId: attachResult.document_sys_id || null,
                fileUrl: attachResult.file_url || null,
                statusCode: statusCode,
                mimeType: attachResult.mime_type || null,
                fileType: attachResult.file_type || null,
                versionSysId: attachResult.versionSysID || null,
                documentSysId: docSysId || null
            };
        } else {
            responseBody = {
                status: (attachResult.status ? attachResult.status.toLowerCase() : "error"),
                message: attachResult.error_message || "Unknown error"
            };
        }

        response.setStatus(statusCode);
        response.setBody(responseBody);
    }

    function sendErrorResponse(statusCode, message) {
        response.setStatus(statusCode);
        response.setBody({
            status: "error",
            message: message
        });
        return;
    }

    function setupAttachParams(docId) {
        return {
            providerId: providerId,
            providerItemId: providerItemId,
            documentId: docId,
            documentName: documentName,
            sourceAttributes: sourceAttributes,
            linkOnly: linkOnly
        };
    }

})(request, response);
