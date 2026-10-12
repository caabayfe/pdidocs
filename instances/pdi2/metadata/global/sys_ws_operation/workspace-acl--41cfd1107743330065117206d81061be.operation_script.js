(function process(request, response) {
    var workspaceId = request.pathParams.workspace_id;
    var urlRoot = '/sys_security_acl.do?sys_id=';

    if (!workspaceId)
        return new sn_ws_err.BadRequestError('No workspace_id provided');

    var service = new WorkspaceAdminHelper();
    aclId = service.generateAclId(workspaceId);

    if (!aclId)
        return new sn_ws_err.BadRequestError('Error retrieving acl url');

    response.setLocation(urlRoot + aclId);
    response.setStatus(301);
})(request, response);
