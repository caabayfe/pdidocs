(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var spManager = new sn_nocpit.ServicePreviewManager();
	var queryParams = request.queryParams;
	var workspace = queryParams.workspace;
	var ciId = queryParams.ciId;
	var isRemoved = spManager.removeFromFavorites(workspace, ciId);
	
	return {
		favorite: !isRemoved
	};
})(request, response);
