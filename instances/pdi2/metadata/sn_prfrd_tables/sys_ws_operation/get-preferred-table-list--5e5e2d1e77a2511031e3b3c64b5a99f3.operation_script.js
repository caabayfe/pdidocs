(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = PreferredTablesUtil.assign({},
        request.pathParams,
        PreferredTablesUtil.normalizeQueryParams(request.queryParams)
    );
    var apiResponse = new TableListAPI(options).build();

    response.setBody(apiResponse);
})(request, response);
