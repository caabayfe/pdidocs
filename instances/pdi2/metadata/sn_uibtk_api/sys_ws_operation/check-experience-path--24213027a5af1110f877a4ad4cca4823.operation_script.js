(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const result = new Experience().checkIfPathInUse(apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.PATH));
        apiHelper.respondSuccesfully({
            inUse: result
        }); 
    });
})(request, response);
