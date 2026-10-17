(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        if (!sysId) {
            apiHelper.respondSuccesfully([]);
        }
        new ComponentBuilderMetadata().deleteComponent(sysId);
        apiHelper.respondSuccesfully();
    });
	
})(request, response);
