(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const params = UDCUtil.assign({},
            request.pathParams,
            request.body.data
        );
        const excludeFileStructure = params?.excludeFileStructure || false;

        if (excludeFileStructure)
            return new AppDetailsService(params).getFilesByTaxonomyTypes();
        else
            return new AppDetailsService(params).getFileCategoriesByApp();
    } catch (e) {
        const LOG = new Logger(`POST:/api/sn_udc/v1/file_taxonomy/app/{appSysId}/fileCategories`);
        LOG.error(`Failed to fetch app file categories: ${e.toString()}`);
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
