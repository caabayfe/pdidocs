(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId),
        result = repo.removeLinkToApplication();

    response.setBody({
        success: !!result
    });
    response.setContentType('application/json');
    response.setStatus(200);

})(request, response);
