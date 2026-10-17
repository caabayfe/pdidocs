(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var success = sn_vcs.AppSourceControl.getRepository(appId)
        .getStash(request.pathParams.stashId)
        .deleteRecord();

    response.setBody({
        success: !!success
    });
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
