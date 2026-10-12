(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var params = request.body.nextEntry();
	var meetingId = request.pathParams.meetingId;
	if (!meetingId)
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	var notesEditor = params.notesEditor;
	if (!notesEditor)
		return new sn_ws_err.BadRequestError("Notes editor id not provided");

	var result = {};

	var instance = CABRuntimeStateSNC.get(meetingId);
	
	if (!instance.canWriteNotes(notesEditor))
		return new sn_ws_err.BadRequestError("User cannot edit meeting notes");
	
	if (instance) {
		instance.setNotesEditor(notesEditor);
		result.msg = 'changed successfully';
	} else
		return new sn_ws_err.NotFoundError('Given meeting record not found');

	return result;

})(request, response);
