(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var respData = {};
	var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.pathParams.table);
	return handlerInstance.updateTaskStateWBActions(request.pathParams.commTaskSysId, request.body.data.action);
})(request, response);
