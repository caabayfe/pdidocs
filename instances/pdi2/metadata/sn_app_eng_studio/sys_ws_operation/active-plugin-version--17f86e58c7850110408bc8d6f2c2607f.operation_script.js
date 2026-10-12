(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var grSysScope = new GlideRecord("sys_scope");

    if (grSysScope.get(CreatorStudioConstants.AES_APPLICATION_SYS_ID)) {
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
        .setDetail(gs.getMessage("App Engine Studio application record not found"));

})(request, response);
