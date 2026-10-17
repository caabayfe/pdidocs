(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /**
     * Builds the metadata for the application currently loaded in the IDE
     */
    try {
        var body = request.body.data;
        var scopeId = body.sys_scope;
        var excludePaths = body.exclude_paths;
        var transactionId = new global.IDEGlobalUtils().getTransactionId();
        var ideService = new sn_glider.IDERequestBuilder();
        var stopWatch = new sn_glider.StopWatch();
        if (!scopeId) {
            return response.setError(
                new sn_ws_err.BadRequestError('[transactionId: ' + transactionId + '] Scope ID was not defined! Cannot handle build request.')
            );
        }
        var buildRequest = ideService.createBuildRequest(scopeId, transactionId, excludePaths);
        stopWatch.time('build:execute');
        var buildResponse = buildRequest.execute();
        stopWatch.timeEnd('build:execute', '[build:execute][scope:' + scopeId + '][transactionId: ' + transactionId + ']');
        var result = ideService.handleBuildResponse(scopeId, buildResponse, transactionId);
        response.setBody(ideService.successResponse('[transactionId: ' + transactionId + '] Successfully built and installed, ' + scopeId, result.logs, result.status));
        return response.setStatus(200);
    } catch (e) {
        gs.error('build request failed', e);
        var svcErr = new sn_ws_err.ServiceError();
        svcErr.setMessage(e.message || e.toString());
        if (e.detailedLog) {
            svcErr.setDetail(e.detailedLog);
        }
        svcErr.setStatus(500);
        return response.setError(svcErr);
    }
})(request, response);
