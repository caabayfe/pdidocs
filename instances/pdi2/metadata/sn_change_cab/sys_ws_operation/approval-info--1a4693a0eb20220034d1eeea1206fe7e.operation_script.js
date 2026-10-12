(function process(request, response) {
	var taskId = request.pathParams.taskId;
	if (!taskId)
		return new sn_ws_err.BadRequestError("Task Item id not provided");
	
	var cabApproval = new CABApproval(taskId);
	response.setBody(cabApproval.toJS());
})(request, response);
