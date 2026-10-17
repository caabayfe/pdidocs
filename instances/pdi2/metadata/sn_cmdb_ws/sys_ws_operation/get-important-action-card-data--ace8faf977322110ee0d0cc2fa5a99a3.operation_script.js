(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var input = request.body.data;
	var manualRefresh = input.manualRefresh;
	var importantActionsUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();
	return importantActionsUtil.getImportantActionCardData(manualRefresh);

})(request, response);
