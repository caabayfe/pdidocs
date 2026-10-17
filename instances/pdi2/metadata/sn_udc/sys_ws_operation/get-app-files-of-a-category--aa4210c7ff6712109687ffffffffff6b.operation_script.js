(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const params = UDCUtil.assign({},
            request.pathParams,
            UDCUtil.normalizeQueryParams(request.queryParams)
        );
        return new AppDetailsService(params).getFilesByTaxonomyTypes();
    } catch (e) {
        const LOG = new Logger(`GET:/api/sn_udc/applications/app/{appSysId}/{typeId}/files`);
        LOG.error(`Failed to fetch app files of a category: ${e.toString()}`);
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
