(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    response.setStatus(200);
    response.setContentType('application/json');
    response.setBody({
        dirty: sn_vcs.AppSourceControl.hasIncomingChanges(appId)
    });

})(request, response);
