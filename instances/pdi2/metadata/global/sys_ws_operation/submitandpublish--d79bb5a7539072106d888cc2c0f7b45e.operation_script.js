(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    let documentSysId = request.pathParams.documentSysId;
    let versionSysId = request.pathParams.versionSysId;
    let action = request.pathParams.action;
    let result;
    if (action == "PUBLISH")
        result = PlatformDocMgmt.publishVersion(versionSysId, documentSysId);
    else if (action == "SUBMIT")
        result = PlatformDocMgmt.submitVersion(versionSysId, documentSysId);
    if (result)
        response.setStatus(200);
    else
        response.setStatus(500);
})(request, response);
