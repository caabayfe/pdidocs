(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appId = request.pathParams.appId;
    var appManagementData = AppManagementDataUtil.getCurrentUserData(appId);

    response.setBody(appManagementData);
    response.setStatus(200);

})(request, response);
