(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	/**
	 * Scaffold an application source files and application metadata
	 */
	try {
		var body = request.body.data;
		var scopeName = body.scopeName;
		var appName = body.appName;
		var appDescription = body.appDescription;
		var packageName = body.packageName;
		var transactionId = new global.IDEGlobalUtils().getTransactionId();
		var stopWatch = new sn_glider.StopWatch();
		var ideService = new sn_glider.IDERequestBuilder();
		if (!scopeName) {
			return response.setError(
				new sn_ws_err.BadRequestError('[transactionId: ' + transactionId + '] scopeName was not defined! Cannot handle scaffold request.')
			);
		}
		if (!appName) {
			return response.setError(
				new sn_ws_err.BadRequestError('[transactionId: ' + transactionId + '] appName was not defined! Cannot handle scaffold request.')
			);
		}
		var scaffoldRequest = ideService.createScaffoldRequest(scopeName, appName, appDescription, packageName, transactionId);
		stopWatch.time('scaffold:execute');
		var scaffoldResponse = scaffoldRequest.execute();
		stopWatch.timeEnd('scaffold:execute', '[scaffold:execute][scope:' + scopeName + '][transactionId: ' + transactionId + '] ');
		var result = ideService.handleScaffoldResponse(scopeName, scaffoldResponse, transactionId);
		if (result.scopeId) {
			var successBody = ideService.successResponse('[transactionId: ' + transactionId + '] Successfully scaffolded and installed, ' + scopeName, result.logs, result.status);
			successBody.scopeId = result.scopeId; 
			response.setBody(successBody);
			return response.setStatus(200);
		} else {
			var err = new sn_ws_err.ServiceError();
			err.setMessage('[transactionId: ' + transactionId + '] Unable to scaffold and install ' + scopeName);
			err.setDetail('Check the error logs for more info');
			err.setStatus(500);
			return response.setError(err);
		}
	} catch (e) {
		gs.error('scaffold request failed', e);
		var svcErr = new sn_ws_err.ServiceError();
		svcErr.setMessage(e.message || e.toString());
		if (e.detailedLog) {
			svcErr.setDetail(e.detailedLog);
		}
		response.setError(svcErr);
		svcErr.setStatus(500);
		return response.setError(svcErr);
	}
})(request, response);
