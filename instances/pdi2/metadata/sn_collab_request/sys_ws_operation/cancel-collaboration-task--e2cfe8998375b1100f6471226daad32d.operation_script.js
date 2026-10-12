(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var taskId = request.pathParams.task_id;

    if (!taskId) {
        var statusCodes = CollabTaskConstants.statusCodes;
        throw new sn_ws_err.ServiceError()
            .setStatus(statusCodes.BAD_REQUEST)
            .setMessage(gs.getMessage("Missing Task Id"));
    }

    var result = CollabTaskServiceV2.cancelCollaborationTask(taskId); 

    response.setBody(result.body);
    response.setStatus(result.status);

})(request, response);
