(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var validSearchWordTypes = ['script_include','table'];
	var params = request.body.data;
	var searchWord = params.searchWord;
	var searchWordType = params.searchWordType;
	var searchTables = params.searchTables;
	var ignoredTables = params.ignoredTables;

	if (!(searchWord && searchWordType))
		return new sn_ws_err.BadRequestError('Missing one or more required fields');
	if (validSearchWordTypes.indexOf(searchWordType) < 0)
		return new sn_ws_err.BadRequestError('Invalid search word type, search word type should be either script_include or table');
	if (ignoredTables!=undefined && !(ignoredTables instanceof Array))
		return new sn_ws_err.BadRequestError('Invalid type, ignoredTables must be an array');
	if (searchTables!=undefined && !(searchTables instanceof Array))
		return new sn_ws_err.BadRequestError('Invalid type, searchTables must be an array');
	if (ignoredTables!=undefined && ignoredTables.length>0 && searchTables!=undefined && searchTables.length>0)
		return new sn_ws_err.BadRequestError('Invalid request, provide either searchTables or ignoredTables but not both');

	var searchRequest = {
		searchWord: searchWord,
		searchWordType: searchWordType,
		searchTables: searchTables,
		ignoredTables: ignoredTables
	};

	var result =  SNC.GlideScriptReferences.getReferences(searchRequest);
	response.setBody({'result':result});
	response.setStatus(200);
})(request, response);
