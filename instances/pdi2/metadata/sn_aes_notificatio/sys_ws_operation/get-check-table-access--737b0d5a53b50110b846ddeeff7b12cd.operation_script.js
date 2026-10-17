(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const tableName = request.pathParams["tableName"];

	if (!tableName) {
		throw new sn_ws_err.ServiceError()
			.setStatus(404)
			.setMessage(gs.getMessageLang("Table name must be provided", "en"))
			.setDetail(gs.getMessage("Path parameter tableName must be provided"));
	}

	const aesNotificationBuilderUtils = new AESNotificationBuilderUtils();
	const canReadTable = aesNotificationBuilderUtils.canReadTable(tableName);

	response.setStatus(200);
	response.setBody({canReadTable: canReadTable});

})(request, response);
