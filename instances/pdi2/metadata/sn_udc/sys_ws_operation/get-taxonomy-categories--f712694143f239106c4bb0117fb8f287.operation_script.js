(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const categories = FileTaxonomyCategoryMap.getCategories();
        return categories;
    } catch (e) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception {0}", [e]));
    }

})(request, response);
