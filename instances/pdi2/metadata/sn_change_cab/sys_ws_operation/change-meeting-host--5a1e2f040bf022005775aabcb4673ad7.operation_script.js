(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var params = request.body.nextEntry();
	var meetingId = request.pathParams.meetingId;
	if (!meetingId)
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	var newHost = params.newHost;
	if (!newHost)
		return new sn_ws_err.BadRequestError("New Presenter id not provided");

	var result = {
	};

	var instance = CABRuntimeStateSNC.get(meetingId);
	if (instance) {
		if (!instance.getHost() || instance.getHost() === instance.getNotesEditor())
			instance.setNotesEditor(newHost);

		instance.setHost(newHost);
		result.msg = 'changed successfully';
	}
	else
		return new sn_ws_err.NotFoundError('Given meeting record not found');

return result;

})(request, response);
