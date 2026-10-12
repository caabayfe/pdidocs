(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var appSysIDs = !global.JSUtil.nil(request.queryParams.appSysIDs) ? request.queryParams.appSysIDs.toString().trim() : "";
    var result = CollabTaskServiceV2.getUserPendingCollaborationTasks(appSysIDs);
    response.setBody(result.body);
    response.setStatus(result.status);


})(request, response);
