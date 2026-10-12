(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var documentSysId = request.pathParams.documentSysId;
    if (!documentSysId) {
        response.setStatus(400);
        response.setBody({
            status: "error",
            message: "Document sys_id is missing"
        });
        return;
    }
    try {
        var multiProviderAPI = new global.MultiProviderDocumentsAPI();
        var syncResult = multiProviderAPI.syncVersionFromProvider(documentSysId);
        var statusCode = multiProviderAPI.getValidStatusCode(syncResult.status_code, syncResult.status);
        var responseBody;
        if (syncResult.status && syncResult.status.toLowerCase() === "success") {
            responseBody = {
                status: syncResult.status.toLowerCase(),
                attachmentSysId: syncResult.attachment_sys_id || null,
                statusCode: statusCode,
                versionSysId: syncResult.versionSysID || null,
                newVersionCreated: typeof syncResult.newVersionCreated === "boolean" ? syncResult.newVersionCreated : false
            };
        } else {
            responseBody = {
                status: (syncResult.status ? syncResult.status.toLowerCase() : "error"),
                message: syncResult.error_message || "Unknown error"
            };
        }
        response.setStatus(statusCode);
        response.setBody(responseBody);
    } catch (err) {
        gs.error("Provider - Sync Item " + err);
        response.setStatus(500);
        response.setBody({
            status: "error",
            message: "Unexpected server error"
        });
    }
})(request, response);
