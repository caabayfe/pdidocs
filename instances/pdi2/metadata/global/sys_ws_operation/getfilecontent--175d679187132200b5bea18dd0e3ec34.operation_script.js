(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;
	var bsId = String(queryParams.bs_id || '');
	var fileId = String(queryParams.file_id || '');
	var fileStableId = String(queryParams.file_stable_id || '');
	var timestamp = String(queryParams.timestamp || Date.now());
	
	if (!fileId || !fileStableId || !bsId) {
		response.setError(new sn_ws_err.BadRequestError('Missing required parameters.'));
		return;
	}
	
    var api = new SNC.TrackedConfigFilesHistoryManager();
	
	var content = api.getFileContent(fileId, fileStableId, bsId, timestamp);
	
	response.setStatus(200);
	response.setContentType("text/plain");
	response.getStreamWriter().writeString(content);

})(request, response);
