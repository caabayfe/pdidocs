(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const options = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );
    try {
        const taxonomyTypes = FileTaxonomy.getTaxonomyTypesDetails(options);
        return taxonomyTypes;
    } catch (e) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
