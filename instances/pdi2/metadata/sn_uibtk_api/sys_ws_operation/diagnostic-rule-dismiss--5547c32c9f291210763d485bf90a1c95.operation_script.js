const apiModules = require('@devsnc/uibtk-api');

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		const { macroponentId, tableName, ruleId, elementId, queryId } = request.body.data;
		const rd = new apiModules.RuleDismiss();
		const dismissRecord = rd.undismissViolation(macroponentId,tableName,ruleId,elementId,queryId);
		apiHelper.getResponse(dismissRecord, BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE_OR_INSERT_DISMISSED_RECORD);
	});

})(request, response);
