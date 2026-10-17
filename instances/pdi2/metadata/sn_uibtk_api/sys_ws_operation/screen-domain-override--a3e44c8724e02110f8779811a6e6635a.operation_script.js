(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID, '');
        const result = new Screen([], true).duplicate(sysId, {
            screen: {
				// Casting to a string because it comes in as an array for some reason
                sysOverrides: sysId.toString()
            }
        });
        typeof result === 'string' ? apiHelper.respondUnsuccesfully(result) : apiHelper.respondSuccesfully(result);
    });
})(request, response);
