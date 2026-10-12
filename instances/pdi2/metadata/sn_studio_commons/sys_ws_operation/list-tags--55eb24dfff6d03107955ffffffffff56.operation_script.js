(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId),
        tags = repo.getTags(),
        result = [];

    while (tags && tags.next()) {
        result.push({
            name: tags.getName()
        });
    }

    response.setBody({
        count: result.length,
        tags: result
    });

    response.setStatus(200);
    response.setContentType('application/json');

})(request, response);
