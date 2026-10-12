(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var progressId = sn_vcs.AppSourceControl
        .refreshRepository()
        .setSysApp()
        .setSysRepoConfig(request.pathParams.repoId)
        .start();

    response.setStatus(202);
    response.setContentType('application/json');
    response.setBody({
        progressId: progressId
    });

})(request, response);
