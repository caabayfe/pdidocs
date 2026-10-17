(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var spManager = new sn_nocpit.ServicePreviewManager();
	var queryParams = request.queryParams;
	var workspace = queryParams.workspace;
	var ciId = queryParams.ciId;
	var isFavorite = spManager.addToFavorites(workspace, ciId);
	
	return {
		favorite: isFavorite
	};
})(request, response);
