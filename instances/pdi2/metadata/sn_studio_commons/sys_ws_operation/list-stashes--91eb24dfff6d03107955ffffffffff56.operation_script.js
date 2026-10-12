(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var stashes = sn_vcs.AppSourceControl.getRepository(appId)
        .getStashes();

    var result = [];
    while (stashes && stashes.next()) {
        if (stashes.getDestinationCommit()) // skip previews
            continue;
        result.push({
            sysId: stashes.getSysId(),
            repoId: stashes.getSysRepoConfigSysId(),
            name: stashes.getName(),
            description: stashes.getDescription(),
            sourceCommit: stashes.getSourceCommit(),
            createdOn: stashes.getSysCreatedOn()
        });
    }

    response.setBody({
        count: result.length,
        stashes: result
    });
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
