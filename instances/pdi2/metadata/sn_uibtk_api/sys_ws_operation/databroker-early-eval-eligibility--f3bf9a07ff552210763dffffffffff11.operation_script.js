const apiModules = require('@devsnc/uibtk-api');

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const {
            macroponentId,
            pageRegistryId,
            testValues,
            macroponentConfig
        } = request.body.data;
        const earlyEvalChecker = new apiModules.DatabrokerEarlyEvalChecker();
        var ruleViolations = earlyEvalChecker.validateDataBrokerEarlyEval(macroponentId, pageRegistryId, testValues,macroponentConfig);
        apiHelper.getResponse(ruleViolations, BuilderToolkitConstants.ERRORS.FAILED_TO_CHECK_DB_EARLY_EVAL_ELIGIBILITY);
    });
})(request, response);
