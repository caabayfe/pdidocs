
			(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
		const tableName = request.queryParams.tableName?.toString();
		const filteredRecords = CatalogTemplateHelper.getCatalogTemplates(tableName);
		response.setBody(filteredRecords);
		response.setStatus(200);
    } catch (exception) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang('Unhandled exception {0}', 'en', [exception]))
            .setDetail(gs.getMessage('Unhandled exception {0}', [exception]));
    }
})(request, response);
