
            (function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var appSysId = request.pathParams.application_sys_id;
        var userPermissions = StudioPermissionService.getUserPermissions(appSysId);
        if (userPermissions?.statusCode) {
            response.setStatus(userPermissions.statusCode);
            response.setBody({
                message: userPermissions.error
            });
        } else {
            response.setBody(userPermissions);
            response.setStatus(200);
        }

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', 'en', [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }
})(request, response);
