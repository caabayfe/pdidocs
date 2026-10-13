(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {};
	var task_tracker_id = new PIWBSetupAssitantProcessor().updateSAStageStatus(request.body.data);
	if(gs.nil(task_tracker_id)) {
		return new sn_ws_err.BadRequestError("Unable to set the status for the task");
	}
	result.status = 'success';
	result.task_tracker_id = task_tracker_id;
	return result;
})(request, response);
