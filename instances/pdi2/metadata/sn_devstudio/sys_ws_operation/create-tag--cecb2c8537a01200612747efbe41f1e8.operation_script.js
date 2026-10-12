(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.verifyPublishAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed)
        VCSAppAccessCheck.throwAccessDenied(appId);

    var progressId = sn_vcs.AppSourceControl.getRepository(appId)
        .workers().createTag()
        .setTagName(request.body.data.tagName)
        .start();

    response.setContentType('application/json');
    response.setBody({
        progressId: progressId
    });
    response.setStatus(202);

})(request, response);
