(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const screenTestValue = apiHelper.getBodyParam(BuilderToolkitConstants.BODY_PARAM.SCREEN_TEST_VALUE, false);
        const screenId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SCREEN_ID, false);
        if (!screenTestValue) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_SCREEN_TEST_VALUE);
        }
        if (!screenId) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_SCREEN_FOUND);
        }
        apiHelper.getResponseGlideOperation(new ScreenTestValue().updateRecord({
            screen: screenId,
            ...screenTestValue
        }), BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
    });

})(request, response);
