(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));
    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var progressId = sn_vcs.AppSourceControl.getRepository(appId)
        .workers()
        .generateStashPreview()
        .setStash(request.body.data.stashId)
        .start();

    response.setBody({
        progressId: progressId
    });

    response.setStatus(202);
    response.setContentType('application/json');

})(request, response);
