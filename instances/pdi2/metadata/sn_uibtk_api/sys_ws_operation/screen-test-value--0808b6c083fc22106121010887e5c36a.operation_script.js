(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		gs.info(JSON.stringify(request.body));
        const screenId = apiHelper.getBodyParam(BuilderToolkitConstants.QUERY_PARAM.SCREEN_ID, false);
		const macroponentId = apiHelper.getBodyParam(BuilderToolkitConstants.QUERY_PARAM.MACROPONENT_ID, false);
		gs.info(macroponentId)
        if (!screenId && !macroponentId) {
            return apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_ID_PROVIDED);
        }
		const newTestValueData = {
			macroponentConfig: BuilderToolkitConstants.SCREEN_TEST_VALUE_MACROPONENT_CONFIG_DEFAULT_VALUE
		};
		if(macroponentId){
			newTestValueData.macroponent = macroponentId;
		}else{
			newTestValueData.screen = screenId;
		}
        apiHelper.getResponseGlideOperation(new ScreenTestValue().updateRecord(newTestValueData), BuilderToolkitConstants.ERRORS.FAILED_TO_UPDATE);
    });

})(request, response);
