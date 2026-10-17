(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var options = TBUtil.assign({},
        request.pathParams,
        TBUtil.normalizeQueryParams(request.queryParams), {
            payload: request.body.data
        }

    );
    var apiResponse = new APIRequestProcessor(APIRequestProcessor.VALIDATE_FIELD_VALUES, options).build();

    response.setBody(apiResponse);

})(request, response);
