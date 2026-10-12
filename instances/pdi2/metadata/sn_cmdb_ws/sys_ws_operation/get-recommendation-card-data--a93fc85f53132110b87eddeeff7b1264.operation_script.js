(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setContentType('application/json');

	var input = request.body.data;
	var maxCardCount = '';
	if (global.JSUtil.notNil(input) && global.JSUtil.notNil(input.maxCardCount)) {
		maxCardCount = Number(input.maxCardCount);
	}
	var actionsUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();
	return actionsUtil.getRecommendationCardData(maxCardCount);
})(request, response);
