(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /**
     * Builds the metadata for the application currently loaded in the IDE
     */
    try {
        var body = request.body.data;
        var scopeId = body.scopeId;
        var appName = body.appName;
        var scopeName = body.scopeName;
        var transactionId = new global.IDEGlobalUtils().getTransactionId();
        var ideService = new sn_glider.IDERequestBuilder();
        var stopWatch = new sn_glider.StopWatch();
        if (!scopeId) {
            return response.setError(
                new sn_ws_err.BadRequestError('[txId: ' + transactionId + '] sys_scope field is missing. Unable to process the build request.')
            );
        }
        var appInfo = {
            scopeId,
            appName,
            scopeName
        };
        var convertRequest = ideService.createConvertRequest(appInfo, transactionId);
        stopWatch.time('convert:execute');
        var convertResponse = convertRequest.execute();
        stopWatch.timeEnd(':execute', '[convert:execute][scope:' + scopeId + '][transactionId: ' + transactionId + ']');
        var result = ideService.handleConvertResponse(appInfo, convertResponse, transactionId);
        response.setBody(ideService.successResponse('[txId: ' + transactionId + '] Successfully converted and installed, ' + scopeId, result.logs, result.status));
        return response.setStatus(200);
    } catch (e) {
        gs.error('Convert request failed', e);
        var svcErr = new sn_ws_err.ServiceError();
        svcErr.setMessage(e.message || e.toString());
        if (e.detailedLog) {
            svcErr.setDetail(e.detailedLog);
        }
        svcErr.setStatus(500);
        return response.setError(svcErr);
    }
})(request, response);
