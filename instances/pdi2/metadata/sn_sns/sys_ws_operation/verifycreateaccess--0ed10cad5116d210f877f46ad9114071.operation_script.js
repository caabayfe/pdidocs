(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const table = request.pathParams.table;
        if (table) {
            const gr = new GlideRecord(table);
            return {
                canCreate: gr.canCreate()
            };
        } else {
            throw `Table name is required.`;
        }

    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', 'en', [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }

})(request, response);
