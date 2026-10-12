(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = TBUtil.assign({},
        request.pathParams,
        TBUtil.normalizeQueryParams(request.queryParams)
    );
    var apiResponse = new APIRequestProcessor(APIRequestProcessor.REQUEST_TABLE_STRUCTURE_DATA, options).build();

    response.setBody(apiResponse);
})(request, response);
