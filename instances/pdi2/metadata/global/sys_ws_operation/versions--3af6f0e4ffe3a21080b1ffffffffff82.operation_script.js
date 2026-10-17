(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var docMgmtUtil = new PlatformDocMgmt;
    var documentSysId = request.pathParams.document_sys_id;
    var versionList = [];
    if (!documentSysId)
        return new sn_ws_err.BadRequestError("Document version sys_id not provided");
    var versionGr = new GlideRecord('ds_document_version');
    versionGr.addQuery('document', documentSysId);
    versionGr.query();
    while (versionGr._next()) {
        versionList.push(JSON.stringify({
            sys_id: versionGr.getValue("sys_id"),
            version: versionGr.getDisplayValue("version"),
            version_state: versionGr.getDisplayValue("version_state"),
            created_on: versionGr.getDisplayValue("sys_created_on"),
            created_by: versionGr.getDisplayValue("sys_created_by"),
            type: versionGr.getDisplayValue("type"),
            url: versionGr.getDisplayValue("url"),
            canWrite: versionGr.canWrite(),
            isLatestVersion: PlatformDocMgmt.isLatestVersion(versionGr.getUniqueValue(), versionGr.getValue("document")),
            canVersionBeSubmitted: PlatformDocMgmt.canVersionBeSubmitted(versionGr)
        }));
    }
    if (versionList.length) {
        response.setStatus(200);
        response.setBody({
            versionList: versionList
        });
    } else {
        response.setStatus(501);
    }
})(request, response);
