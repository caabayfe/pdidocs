(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );
    const {
        appSysId,
        enforceLimit
    } = params;

    return FileTaxonomy.getFilesByApp(appSysId, enforceLimit);
})(request, response);
