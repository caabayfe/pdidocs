(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var importantActionsUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();
	return importantActionsUtil.getImportantActionConfigs();

})(request, response);
