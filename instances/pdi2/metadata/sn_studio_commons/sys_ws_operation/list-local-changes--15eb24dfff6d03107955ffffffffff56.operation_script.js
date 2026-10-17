(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed)
        VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId);
    var changes = repo.getOutgoingChanges();

    response.setBody(changes);
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
