(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );
    var apiResponse = DeveloperHistory.getHistoryEntries(options);

    response.setBody(apiResponse);

})(request, response);
