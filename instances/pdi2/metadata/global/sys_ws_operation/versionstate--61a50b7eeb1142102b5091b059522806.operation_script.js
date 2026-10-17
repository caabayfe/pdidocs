(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var versionSysId = request.pathParams.version_sys_id;
    if (!versionSysId)
        return new sn_ws_err.BadRequestError("Docuemnt version Sys id not provided");
    var versionRecord = new GlideRecordSecure('ds_document_version');
    if (!versionRecord.get(versionSysId)) {
        response.setStatus(200);
        response.setBody({
            message: 'Document version not found.'
        });
        return;
    }
    versionRecord.query();
    if (versionRecord.next()) {
        var versionState = versionRecord.getValue('version_state');
        response.setStatus(200);
        response.setBody({
            state: versionState,
            canWrite: versionRecord.canWrite()
        });
    } else {
        response.setStatus(404);
    }
})(request, response);
