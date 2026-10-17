(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId),
        stash = repo.getStash(request.pathParams.stashId);

    if (stash) {
        response.setBody({
            sysId: stash.getSysId(),
            repoId: stash.getSysRepoConfigSysId(),
            name: stash.getName(),
            description: stash.getDescription(),
            sourceCommit: stash.getSourceCommit(),
            destinationCommit: stash.getDestinationCommit()
        });
    }

    response.setStatus(200);
    response.setContentType('application/json');

})(request, response);
