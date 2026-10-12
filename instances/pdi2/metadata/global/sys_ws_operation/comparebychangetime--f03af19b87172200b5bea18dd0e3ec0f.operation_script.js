(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;
	var bsId = String(queryParams.bs_id || '');
	var fileId = String(queryParams.file_id || '');
	var fileStableId = String(queryParams.file_stable_id || '');
	var timestamp = String(queryParams.timestamp || '');
	var showIdenticalDiff = queryParams.show_identical_diff === "true";
	
	if (!fileId || !fileStableId || !bsId || !timestamp) {
		response.setError(new sn_ws_err.BadRequestError('Missing required parameters.'));
		return;
	}
	
	var api = new SNC.TrackedConfigFilesHistoryManager();
	
	var values = api.getFileContentsForCompare(fileId, fileStableId, bsId, timestamp);
	var oldValue = String(values.get("oldValue"));
	var newValue = String(values.get("value"));
	
	var differ = new Differ();
	var content = differ.diff(oldValue, newValue, "", showIdenticalDiff);
	
	response.setStatus(200);
	response.setContentType("text/html");
	//content can be empty string (identical values compared)
	response.getStreamWriter().writeString(content);

})(request, response);
