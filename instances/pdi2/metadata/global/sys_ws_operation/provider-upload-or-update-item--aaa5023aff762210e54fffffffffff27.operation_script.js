(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestData = request.body.data;
    var providerDetailSysId = requestData.providerDetailSysId;
    var documentSysId = requestData.documentSysId;

    if (!documentSysId) {
        response.setStatus(400);
        response.setBody({
            status: "error",
            message: 'Document sys_id is missing'
        });
        return;
    }

    var targetFolderUrl = requestData.folderUrl;
    var targetFolderPath = requestData.folderPath;
    var shouldDeleteAttachment = !!requestData.removeVersionFile;
    var multiProviderAPI = new global.MultiProviderDocumentsAPI();

    var documentGR = new GlideRecordSecure('ds_document');
    if (!documentGR.get(documentSysId)) {
        response.setStatus(404);
        response.setBody({
            status: "error",
            message: 'Document Sys ID is invalid, please pass a valid sysId'
        });
        return;
    }

    try {
        var isConnected = !!documentGR.getValue('mp_document'); // true if mp_document has a value
        var apiResult;
        if (!isConnected) {
            // Only upload if not already connected to external provider
            var uploadParams = {
                providerDetailSysId: providerDetailSysId,
                documentSysId: documentSysId,
                folderURL: targetFolderUrl,
                folderPath: targetFolderPath,
                removeVersionFile: shouldDeleteAttachment
            };
            apiResult = multiProviderAPI.uploadAttachmentToProvider(uploadParams);
        } else {
            // If already connected, just update the version
            var updateParams = {
                documentSysId: documentSysId,
                removeVersionFile: shouldDeleteAttachment
            };
            apiResult = multiProviderAPI.updateAttachmentToProvider(updateParams);
        }

        var statusCode = multiProviderAPI.getValidStatusCode(apiResult.status_code, apiResult.status);
        var responseBody;
        if (apiResult.status && apiResult.status.toLowerCase() === "success") {
            responseBody = {
                fileUrl: apiResult.file_url || null,
                mpDocumentSysId: apiResult.document_sysid || apiResult.document_sys_id || null,
                status: apiResult.status.toLowerCase(),
                statusCode: statusCode,
                offloadFileStatus: typeof apiResult.offloadFileStatus !== "undefined" ? apiResult.offloadFileStatus : null
            };
        } else {
            responseBody = {
                status: (apiResult.status ? apiResult.status.toLowerCase() : "error"),
                message: apiResult.error_message || "Unknown error"
            };
        }
        response.setStatus(statusCode);
        response.setBody(responseBody);
    } catch (err) {
        gs.error("Provider - Upload or Update Item " + err);
        response.setStatus(500);
        response.setBody({
            status: "error",
            message: "Unexpected server error"
        });
    }
})(request, response);
