(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const params = UDCUtil.assign({},
            request.pathParams,
            UDCUtil.normalizeQueryParams(request.queryParams)
        );

        const searchResults = new SearchResultBuilder(params).build();
        return searchResults;
    } catch (e) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
