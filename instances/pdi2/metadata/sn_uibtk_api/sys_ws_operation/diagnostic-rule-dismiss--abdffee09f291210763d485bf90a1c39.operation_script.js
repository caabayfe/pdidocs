const apiModules = require('@devsnc/uibtk-api');

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		const { macroponentId, tableName, ruleId, elementId, queryId } = request.body.data;
		const rd = new apiModules.RuleDismiss();
		const dismissedBy = gs.getUserID() ?? '';
		const dismissRecord = rd.dismissViolation(macroponentId,tableName,ruleId,elementId,dismissedBy,queryId);
		apiHelper.getResponse(dismissRecord, BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE_OR_INSERT_DISMISSED_RECORD);
	});
})(request, response);
