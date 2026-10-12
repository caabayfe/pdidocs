(function process(request, response) {
	var appId = request.pathParams.appId;
	var trackerId = request.pathParams.trackerId;
	var str = request.body.dataString;
	sn_vcs.MIDTracker.updateMessage(trackerId, str);

	response.setContentType('application/json');
	response.setStatus(202);

})(request, response);
