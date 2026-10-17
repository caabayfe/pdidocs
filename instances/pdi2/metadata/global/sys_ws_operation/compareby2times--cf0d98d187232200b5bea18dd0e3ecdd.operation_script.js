(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;
	var bsId = String(queryParams.bs_id || '');
	var fileId = String(queryParams.file_id || '');
	var fileStableId = String(queryParams.file_stable_id || '');
	var fromTimestamp = String(queryParams.from_timestamp || '');
	var toTimestamp = String(queryParams.to_timestamp || '');
	var showIdenticalDiff = String(queryParams.show_identical_diff) === "true";
	
	if (!bsId || !fileId || !fileStableId || !fromTimestamp || !toTimestamp) {
		response.setError(new sn_ws_err.BadRequestError('Missing required parameters.'));
		return;
	}
	
    var api = new SNC.TrackedConfigFilesHistoryManager();
	
	var oldValue = api.getFileContent(fileId, fileStableId, bsId, fromTimestamp);
	var newValue = api.getFileContent(fileId, fileStableId, bsId, toTimestamp);
	
	var differ = new Differ();
	var compareResult = differ.diff(oldValue, newValue, "", showIdenticalDiff);
	
	response.setStatus(200);
	response.setContentType("text/html");
	//content can be empty string (identical values compared)
	response.getStreamWriter().writeString(compareResult);

})(request, response);
