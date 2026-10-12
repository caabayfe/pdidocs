(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const rangeStart = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.RANGE_START);
        const rangeEnd = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.RANGE_END);
        if (!sysId) {
            apiHelper.respondSuccesfully([]);
        }
        const result = new ComponentUsage().getPageDetails(sysId, rangeStart, rangeEnd);
        apiHelper.respondSuccesfully(result);
    });
	
})(request, response);
