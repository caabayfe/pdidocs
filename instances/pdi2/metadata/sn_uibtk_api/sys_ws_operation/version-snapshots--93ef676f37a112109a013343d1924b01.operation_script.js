(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const recordType = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.RECORD_TYPE);
        let result = [];
        if (recordType === 'page') {
            const macroponentSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.MACROPONENT_ID);
            const screenSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SCREEN_ID);
            result = new VersionsHandler().getPageVersionSnapshots(screenSysId, macroponentSysId);
        }

        apiHelper.respondSuccesfully(result);
    });

})(request, response);
