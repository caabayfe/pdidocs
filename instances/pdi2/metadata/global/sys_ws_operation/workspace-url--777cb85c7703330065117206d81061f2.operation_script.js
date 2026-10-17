(function process(request, response) {
    var workspaceId = request.pathParams.workspace_id;
    var fullUrl;

    if (!workspaceId)
        return new sn_ws_err.BadRequestError('No workspace_id provided');

    var service = new WorkspaceAdminHelper();
    fullUrl = service.generateFullUrl(workspaceId);

    if (!fullUrl)
        return new sn_ws_err.BadRequestError('Error retrieving workspace url');

    response.setLocation(fullUrl);
    response.setStatus(301);
})(request, response);
