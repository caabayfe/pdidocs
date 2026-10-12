(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
		const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const result = new ComponentBuilderMetadata().getComponent(sysId);
        apiHelper.respondSuccesfully(result);
    });

})(request, response);
