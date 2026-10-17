(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var actionsUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();
	return actionsUtil.getRecommendationConfigs();

})(request, response);
