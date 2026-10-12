(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    if (!gs.hasRole("security_admin")) {
                var accessRestrictedError = new sn_ws_err.ServiceError();
                accessRestrictedError.setStatus(403);
                accessRestrictedError.setMessage(gs.getMessage("Insufficent privileges to get progress state"));
                response.setError(accessRestrictedError);

                return;
        }

        if (!request.pathParams.workerId) {
                response.setError(new sn_ws_err.BadRequestError(gs.getMessage('request is missing progress id')));

                return;
        }

        var progressWorkerGR = new GlideRecord('sys_progress_worker');
        progressWorkerGR.get(request.pathParams.workerId);
        if (!progressWorkerGR.isValidRecord()) {
                return new sn_ws_err.BadRequestError(gs.getMessage('progress information not available'));
        }

        var progressState = progressWorkerGR.getValue('state');
        if (progressState == 'cancelled')
                return new sn_ws_err.BadRequestError(gs.getMessage('progress worker cancelled'));

        return { "progressState": progressState };

})(request, response);
