(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const requestData = request.body.data;
    const types = requestData.types || [];
    try {
        const result = {};
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const typeSysId = type.typeSysId;
            const builder = type.builder;
            result[typeSysId] = FileTaxonomy.validateType(typeSysId, builder);
        }
        return result;
    } catch (e) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unhandled exception: {0}", "en", [e]))
            .setDetail(gs.getMessage("Unhandled exception: {0}", [e]));
    }

})(request, response);
