(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var permissionType = request.body && request.body.data && request.body.data.permission_type;
    var sysUser = request.body && request.body.data && request.body.data.sys_user;

    if (sysUser && permissionType) {
        var utils = new AppIntakeUtils();
        var result = utils.addUserToGroup(sysUser, permissionType);

        response.setBody(result);
        response.setStatus(200);
    } else {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(gs.getMessageLang("Request requires a sys_user and permission type(s).", "en"))
            .setDetail(gs.getMessage("Provisioning a user requires a sys_user and permission type(s)."));
    }

})(request, response);
