(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var grSysScope = new GlideRecord("sys_scope");

    if (grSysScope.get(CollabTaskConstants.COLLAB_REQUEST_APP_ID)) {
        var activeVersion = grSysScope.getValue("version");

        response.setStatus(200);
        response.setBody({
            active_version: activeVersion
        });

        return;
    }

    throw new sn_ws_err.ServiceError()
        .setStatus(404)
        .setMessage(gs.getMessage("Application record not found"))
        .setDetail(gs.getMessage("Collaboration Request application record not found"));

})(request, response);
