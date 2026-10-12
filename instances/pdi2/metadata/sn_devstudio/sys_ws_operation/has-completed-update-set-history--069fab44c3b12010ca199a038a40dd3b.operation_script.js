(function process(request, response) {
    var appId = request.pathParams.appId;

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    response.setStatus(200);
    response.setContentType('application/json');
    response.setBody({
        hasUpdateSetCommitHistory: sn_vcs.AppSourceControl.hasUpdateSetCommitHistory(appId)
    });


})(request, response);
