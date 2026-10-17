(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var taskRunId = request.queryParams.taskRunId;
    return new DuplicateTaskRecommendationsUtil().getDuplicateTaskRecommendations(request.pathParams.taskId, taskRunId ? taskRunId[0] : null);

})(request, response);
