(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = TBUtil.assign({},
        request.pathParams,
        TBUtil.normalizeQueryParams(request.queryParams)
    );
    var apiResponse = new APIRequestProcessor(APIRequestProcessor.REQUEST_FLOW_LIST, options).build();
    response.setBody(apiResponse);

})(request, response);
