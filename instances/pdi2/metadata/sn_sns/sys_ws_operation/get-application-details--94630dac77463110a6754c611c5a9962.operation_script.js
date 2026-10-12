
            (function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var appSysId = request.pathParams.application_sys_id;
        var appDetails = StudioApplicationService.getAppDetails(appSysId);

        if (appDetails?.statusCode) {
            response.setStatus(appDetails.statusCode);
            response.setBody({
                message: appDetails.error
            });
        } else {
            response.setBody(appDetails);
            response.setStatus(200);
        }

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', 'en', [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }
})(request, response);
