(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var applicationSysId = request.pathParams.application_sys_id;

    if (!applicationSysId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(gs.getMessage("Missing App Id"));
    }

    if (!RoleBuilderPermissions.canReadApp(applicationSysId)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage(gs.getMessage('403 Forbidden: User does not have access to app with id {0}.', applicationSysId));
    }

    try {
        var result = {
            canWriteRoles: RoleBuilderPermissions.canWriteRoles()
        };

        response.setBody(result);
        response.setStatus(200);

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', "en", [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));

    }

})(request, response);
