(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var table = request.queryParams.sysparm_table;
	if (!table)
		return new sn_ws_err.BadRequestError("sysparm_table is not provided");
    return new CommunicationManagementUtil().getChannelMap(table);

})(request, response);
