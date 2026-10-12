(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var attachmemtSysId = request.pathParams.sys_id + '';
	var response_body = {};
	var attachmentRecord = new GlideRecordSecure('sys_attachment');
	if (!attachmentRecord.get(attachmemtSysId)) {
		response.setStatus(404);
		response_body.errMsg = gs.getMessage("Resource not found");
		return response_body;
	}
	
	return sn_snap.AntiVirusOnDemandAdvisor.getAvailabilityForDownload(attachmemtSysId);

})(request, response);
