(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = TBUtil.assign({},
        request.pathParams,
        TBUtil.normalizeQueryParams(request.queryParams), {
            payload: request.body.data
        });

	var apiResponse = new APIRequestProcessor(APIRequestProcessor.DELETE_TABLE_RECORDS, options).build();

    response.setBody(apiResponse);
})(request, response);
