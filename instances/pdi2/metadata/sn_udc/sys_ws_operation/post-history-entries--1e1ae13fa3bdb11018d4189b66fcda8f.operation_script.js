(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var options = UDCUtil.assign({},
            request.pathParams,
            UDCUtil.normalizeQueryParams(request.queryParams), {
                payload: request.body.data
            }
        );

        options.payload.validEntries = DeveloperHistory.validatePayload(options);

        var apiResponse = DeveloperHistory.addHistoryEntries(options);

        response.setBody(apiResponse);
    } catch (error) {
        return new sn_ws_err.BadRequestError(error);
    }
})(request, response);
