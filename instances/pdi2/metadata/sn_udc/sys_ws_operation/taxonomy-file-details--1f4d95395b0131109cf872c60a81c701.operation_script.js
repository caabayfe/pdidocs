(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const params = UDCUtil.assign({},
        request.pathParams,
        UDCUtil.normalizeQueryParams(request.queryParams)
    );
    const tableName = params.tableName;
    const builderId = params.builderId;
    const sysId = params.sysId;

    return TaxonomyHelper.getTaxonomyFileDetails(tableName, sysId, builderId);

})(request, response);
