(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var appSysId = request.pathParams.application_sys_id;
        var appDetailsSysId = AppDetailsService.createAppDetails(appSysId, request.body.data);
    } catch (exception) {
        switch (exception) {
            case CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessageLang("Application does not exist.", "en"))
                    .setDetail(gs.getMessage("Application does not exist."));
            case CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED:
                throw new sn_ws_err.ServiceError()
                    .setStatus(403)
                    .setMessage(gs.getMessageLang("Access denied to application.", "en"))
                    .setDetail(gs.getMessage("Access denied to application."));
            case CreatorStudioConstants.errors.IMPROPER_FORMAT:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Operations must be an array.", "en"))
                    .setDetail(gs.getMessage("Operations must be an array."));
            case CreatorStudioConstants.errors.INSERT_FAILURE:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Failed to insert sn_app_eng_studio_app_metadata record.", "en"))
                    .setDetail(gs.getMessage("Failed to insert sn_app_eng_studio_app_metadata record."));
            default:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", exception))
                    .setDetail(gs.getMessage("Unhandled exception {0}", exception));
        }
    }

    response.setBody({
        details: appDetailsSysId,
        app_sys_id: appSysId
    });
    response.setStatus(201);
})(request, response);
