(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var constants = new global.DocumentManagementConstantUtil();
    var documentManager = new global.DocumentObjectManager();
    var documentUtil = new global.DocumentManagementUtilSNC();

    try {
        var operations = request.body.data;
        if (!Array.isArray(operations) || operations.length === 0)
            return sendErrorResponse(constants.statusCode.BAD_REQUEST, constants.requestBodyInvalidMessage);

        // Validate operation limit (max 10 operations per API call to prevent timeouts)
        var totalOperations = 0;
        for (var opIdx = 0; opIdx < operations.length; opIdx++) {
            if (operations[opIdx].data && Array.isArray(operations[opIdx].data)) {
                totalOperations += operations[opIdx].data.length;
                if (totalOperations > 10)
                    return sendErrorResponse(constants.statusCode.BAD_REQUEST, constants.operationLimitExceededMessage);
            }
        }

        var results = [];
        for (var i = 0; i < operations.length; i++) {
            var operation = operations[i];

            if (!operation.type || !operation.data) {
                results.push(createErrorResult(constants.invalidOperationStructureFieldsMessage, constants.statusCode.BAD_REQUEST));
                continue;
            }
            if (!Array.isArray(operation.data) || operation.data.length === 0) {
                results.push(createErrorResult(constants.invalidOperationStructureDataMessage, constants.statusCode.BAD_REQUEST));
                continue;
            }
            for (var j = 0; j < operation.data.length; j++) {
                var result = processOperation(operation.type, operation.data[j]);
                results.push(result);
            }
        }

        var statusCode = determineHttpStatusCode(results);
        response.setStatus(statusCode);

        var cleanResults = results.map(function(result) {
            var clean = {};
            for (var key in result) {
                if (key !== 'statusCode')
                    clean[key] = result[key];
            }
            return clean;
        });
        response.setBody(cleanResults);
    } catch (error) {
        gs.error("Document Create API - Unexpected error: " + String(error));
        return sendErrorResponse(constants.statusCode.INTERNAL_SERVER_ERROR, constants.unexpectedErrorMessage);
    }

    function processOperation(operationType, data) {
        switch (operationType) {
            case constants.operationTypes.CONVERT_ATTACHMENT:
                return handleConvertAttachmentToDocument(data);
            case constants.operationTypes.LINK_FROM_DMS:
                return handleLinkingFromDMS(data);
            case constants.operationTypes.CREATE_FROM_CLOUD:
                return handleCreateFromCloud(data);
            default:
                return createErrorResult(constants.unknownOperationTypeMessage + operationType, constants.statusCode.BAD_REQUEST);
        }
    }

    function handleConvertAttachmentToDocument(data) {
        try {
            var validationError = validateRequiredField(data.attachmentSysId, constants.requestFields.ATTACHMENT_SYS_ID);
            if (validationError)
                return createErrorResult(validationError, constants.statusCode.BAD_REQUEST);

            var result = documentUtil.createAndLinkDocFromAttachment(data.attachmentSysId, data.documentName);

            if (result.status && result.status.toLowerCase() === constants.status.ERROR) {
                var statusCode = result.statusCode || constants.statusCode.INTERNAL_SERVER_ERROR;
                return createErrorResult(result.errorMessage || constants.failedToConvertAttachmentMessage, statusCode);
            }
            return {
                status: constants.status.SUCCESS,
                statusCode: result.statusCode || constants.statusCode.OK,
                response: {
                    documentSysId: result.documentSysId,
                    documentVersionSysId: result.versionSysId,
                    attachmentSysId: result.attachmentSysId,
                    documentName: result.documentName,
                    fileName: result.fileName,
                    fileSizeInBytes: result.fileSize,
                    createdTime: result.createdTime,
                    mimeType: result.mimeType,
                    documentReferenceSysId: result.documentReferenceSysId
                }
            };
        } catch (error) {
            gs.error("Error in handleConvertAttachmentToDocument: " + String(error));
            return createErrorResult(constants.unexpectedErrorMessage, error.statusCode || constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    }

    function handleLinkingFromDMS(data) {
        try {
            var validationError = validateRequiredField(data.documentSysId, constants.requestFields.DOCUMENT_SYS_ID) ||
                validateRequiredField(data.targetTableName, constants.requestFields.TARGET_TABLE_NAME) ||
                validateRequiredField(data.targetRecordSysId, constants.requestFields.TARGET_RECORD_SYS_ID);

            if (validationError)
                return createErrorResult(validationError, constants.statusCode.BAD_REQUEST);

            var recordAccess = documentManager.validateRecordAccess(data.targetTableName, data.targetRecordSysId);
            if (!recordAccess.valid)
                return createErrorResult(recordAccess.error, constants.statusCode.FORBIDDEN);

            var referenceSysId = documentManager.insertReferenceForTargetRecord(
                data.documentSysId,
                data.targetTableName,
                data.targetRecordSysId
            );

            if (!referenceSysId)
                return createErrorResult(constants.failedToLinkDocumentMessage + data.documentSysId, constants.statusCode.INTERNAL_SERVER_ERROR);

            var documentName = documentManager.getFieldValue(constants.tables.DOCUMENT, data.documentSysId, constants.tableColumns.NAME);
            var createdTime = documentManager.getFieldValue(constants.tables.DOCUMENT, data.documentSysId, constants.tableColumns.SYS_CREATED_ON);

            var versionSysId = documentManager.getLatestRecordSysId(constants.tables.DOCUMENT_VERSION, {
                document: data.documentSysId
            });
            var attachmentDetails = documentManager.getAttachmentDetailsFromVersion(versionSysId);

            return {
                status: constants.status.SUCCESS,
                statusCode: constants.statusCode.OK,
                response: {
                    documentSysId: data.documentSysId,
                    documentVersionSysId: versionSysId,
                    attachmentSysId: attachmentDetails.attachmentSysId,
                    documentName: documentName,
                    fileName: attachmentDetails.fileName,
                    fileSizeInBytes: attachmentDetails.fileSize,
                    createdTime: createdTime,
                    mimeType: attachmentDetails.mimeType,
                    documentReferenceSysId: referenceSysId
                }
            };
        } catch (error) {
            gs.error("Error in handleLinkingFromDMS: " + String(error));
            return createErrorResult(constants.unexpectedErrorMessage, error.statusCode || constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    }

    function handleCreateFromCloud(data) {
        var documentSysId = null;

        try {
            var validationError = validateRequiredField(data.providerId, constants.requestFields.PROVIDER_ID) ||
                validateRequiredField(data.providerItemId, constants.requestFields.PROVIDER_ITEM_ID) ||
                validateRequiredField(data.documentName, constants.requestFields.DOCUMENT_NAME) ||
                validateRequiredField(data.targetTableName, constants.requestFields.TARGET_TABLE_NAME) ||
                validateRequiredField(data.targetRecordSysId, constants.requestFields.TARGET_RECORD_SYS_ID);

            if (validationError)
                return createErrorResult(validationError, constants.statusCode.BAD_REQUEST);

            var recordAccess = documentManager.validateRecordAccess(data.targetTableName, data.targetRecordSysId);
            if (!recordAccess.valid)
                return createErrorResult(recordAccess.error, constants.statusCode.FORBIDDEN);

            documentSysId = documentManager.createDocumentForTargetRecord(
                data.targetTableName,
                data.targetRecordSysId, {
                    name: data.documentName
                }
            );

            if (!documentSysId)
                return createErrorResult(constants.failedToCreateDocumentMessage, constants.statusCode.INTERNAL_SERVER_ERROR);

            var multiProviderAPI = new global.MultiProviderDocumentsAPI();
            var attachResult = multiProviderAPI.attachFromProvider({
                providerId: data.providerId,
                providerItemId: data.providerItemId,
                documentId: documentSysId,
                documentName: data.documentName,
                sourceAttributes: data.sourceAttributes,
                linkOnly: data.linkOnly || false
            });

            if (!attachResult.status || attachResult.status.toLowerCase() !== constants.status.SUCCESS) {
                documentManager.deleteDocumentV2(documentSysId);
                return createErrorResult(attachResult.error_message || constants.failedToAttachFromProviderMessage, constants.statusCode.INTERNAL_SERVER_ERROR);
            }

            var documentReferenceSysId = documentManager.getLatestRecordSysId(constants.tables.DOCUMENT_REFERENCES, {
                document: documentSysId,
                target_record: data.targetRecordSysId,
                table_name: data.targetTableName
            });

            var createdTime = documentManager.getFieldValue(constants.tables.DOCUMENT, documentSysId, constants.tableColumns.SYS_CREATED_ON);
            var attachmentDetails = documentManager.getAttachmentDetailsFromVersion(attachResult.versionSysID);

            return {
                status: constants.status.SUCCESS,
                statusCode: constants.statusCode.OK,
                response: {
                    documentSysId: documentSysId,
                    documentVersionSysId: attachResult.versionSysID,
                    attachmentSysId: attachmentDetails.attachmentSysId,
                    documentName: data.documentName,
                    fileName: attachmentDetails.fileName,
                    fileSizeInBytes: attachmentDetails.fileSize,
                    createdTime: createdTime,
                    mimeType: attachmentDetails.mimeType,
                    documentReferenceSysId: documentReferenceSysId
                }
            };
        } catch (error) {
            if (documentSysId)
                documentManager.deleteDocumentV2(documentSysId);

            gs.error("Error in handleCreateFromCloud: " + String(error));
            return createErrorResult(constants.unexpectedErrorMessage, error.statusCode || constants.statusCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Determines the overall HTTP status code based on operation results.
     * Returns 200 if all success, 207 if mixed, or the error code if all errors are the same.
     */
    function determineHttpStatusCode(results) {
        if (!results || results.length === 0)
            return constants.statusCode.BAD_REQUEST;

        var successCount = 0;
        var errorCount = 0;
        var firstErrorCode = null;
        var allErrorsSameCode = true;

        for (var i = 0; i < results.length; i++) {
            if (results[i].status === constants.status.SUCCESS)
                successCount++;
            else {
                errorCount++;
                var currentErrorCode = results[i].statusCode || constants.statusCode.INTERNAL_SERVER_ERROR;
                if (firstErrorCode === null)
                    firstErrorCode = currentErrorCode;
                else if (firstErrorCode !== currentErrorCode)
                    allErrorsSameCode = false;
            }
        }
        if (errorCount === 0)
            return constants.statusCode.OK;
        if (successCount === 0 && allErrorsSameCode)
            return firstErrorCode;
        return constants.statusCode.MULTI_STATUS;
    }

    /**
     * Helper function to create error result object
     * statusCode is used internally for HTTP response status determination
     */
    function createErrorResult(errorMessage, statusCode) {
        return {
            status: constants.status.ERROR,
            statusCode: statusCode || constants.statusCode.INTERNAL_SERVER_ERROR,
            error: {
                message: errorMessage
            }
        };
    }

    function validateRequiredField(value, fieldName) {
        if (!value || (typeof value === 'string' && value.trim() === ''))
            return fieldName + constants.fieldRequiredMessage;
        return null;
    }
    /**
     * Helper function to send error responses (used for top-level errors)
     */
    function sendErrorResponse(statusCode, message) {
        response.setStatus(statusCode);
        response.setBody({
            status: constants.status.ERROR,
            message: message
        });
    }

})(request, response);
