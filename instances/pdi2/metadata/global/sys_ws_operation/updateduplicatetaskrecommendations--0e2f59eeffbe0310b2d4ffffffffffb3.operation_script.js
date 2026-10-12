(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    return new DuplicateTaskRecommendationsUtil().updateDuplicateTaskRecommendations(request.pathParams.taskRunId, request.body.data);

})(request, response);
