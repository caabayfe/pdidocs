(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.verifyPublishAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId),
        status;

    if (repo) {
        status = 200;
        var midServerId = repo.getMidServer();
        var credentialId = repo.getCredential();

        var midServerName = "";

        if (midServerId) {
            var ecc_agent = new GlideRecord('ecc_agent');
            ecc_agent.get(midServerId);
            midServerName = ecc_agent.getValue('name');
        }

        var credentialName = "";

        var credential = new GlideRecord('discovery_credentials');
        if (credential.get(credentialId))
            credentialName = credential.getValue('name');

        response.setBody({
            appId: appId,
            repoId: repo.getSysId(),
            url: repo.getRepositoryURL(),
            currentBranch: repo.getCurrentBranch(),
            sha: repo.getCurrentCommit(),
            shortDescription: repo.getShortDescription(),
            hasLocalChanges: repo.hasOutgoingChanges(),
            hasRemoteChanges: repo.hasIncomingChanges(),
            midServerId: repo.getMidServer(),
            midServerName: midServerName,
            credentialId: credentialId,
            credentialName: credentialName,
            defaultEmail: repo.getDefaultCommitEmail(),
            useDefaultEmailForAllCommits: repo.getUseDefaultEmailForAllCommits()
        });
    } else {
        status = 404;
    }

    response.setContentType('application/json');
    response.setStatus(status);

})(request, response);
