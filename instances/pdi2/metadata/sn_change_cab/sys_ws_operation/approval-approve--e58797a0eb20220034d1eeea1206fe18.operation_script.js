(function process(request, response) {
	var taskId = request.pathParams.taskId;
	var params = request.body.nextEntry();
	
	if (!taskId)
		return new sn_ws_err.BadRequestError("Task Item id not provided");
	
	var taskGr = new GlideRecord("task");
	if (!taskGr.get(taskId))
		return new sn_ws_err.NotFoundError("Requested Task not found");

	var cabApproval = new CABApproval(taskGr);
	
	if (!cabApproval.approve(params.comment, params.approvalGroupSysID))
		return sn_ws_err.NotAcceptableError("Approve action not accepted");
	
	return {
		"taskId": taskGr.getUniqueValue(),
		"approved": true
	};
})(request, response);
