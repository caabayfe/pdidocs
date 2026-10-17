var {
    RuleChecker
} = require('@devsnc/uibtk-api');

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var rc = new RuleChecker();
    var appRoutes = rc.checkAllRulesAgainstSubpageFromPc(
		request.pathParams.extensionPointId,
		request.pathParams.parentScreenId,
		request.pathParams.parentElementId,
		request.pathParams.isMaint,
	);

    response.setBody({
        appRoutes
    });

})(request, response);
