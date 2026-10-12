(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

	var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.verifyPublishAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var isFound =
        typeof sn_vcs !== 'undefined' &&
        typeof sn_vcs.AppSourceControl !== 'undefined' &&
        sn_vcs.AppSourceControl.isInSourceControl(appId);

    response.setBody({
        found: isFound
    });
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
