(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const taxonomyFileStructure = FileTaxonomy.cacheAndGetTaxonomyStructure();
        const params = UDCUtil.assign({},
            UDCUtil.normalizeQueryParams(request.queryParams)
        );
        if (params && params.sysparm_transaction_scope) {
            taxonomyFileStructure.types = FileTaxonomy.filterTypesForTransactionScope(taxonomyFileStructure.types);
            delete taxonomyFileStructure.categories;
        }
        return taxonomyFileStructure;
    } catch (e) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
