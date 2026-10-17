(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var requestParams = request.body.data,
        commitMessage = requestParams.msg || gs.getMessage('Initial state of application at link to source control');

    var shouldCommit = (requestParams.commitUpdateSetHistory == 'true');
	var credential = SourceControlHelper.getAppropriateCredential(requestParams.url, requestParams.credential);

    var progressId, repo;
    repo = sn_vcs.AppSourceControl.registerRepository()
        .setSysApp(appId)
        .setRepositoryURL(requestParams.url)
        .setCredential(credential)
        .setDefaultBranchName(requestParams.remoteDefaultBranchName)
        .setBranchName(requestParams.branch)
        .setShortDescription(requestParams.shortDescription || '')
        .setCommitMessage(commitMessage)
        .setTestConnection(!!requestParams.setTestConnection)
        .setDefaultCommitEmail(requestParams.email)
        .setUseDefaultEmailForAllCommits(requestParams.use_default_email_for_all)
        .setCommitUpdateSetHistory(shouldCommit);

    if (requestParams.hasOwnProperty("upgradeBaseApp"))
        repo.setUpgradeVendorApp(requestParams.upgradeBaseApp);

    if (requestParams.mid_server) 
		repo.setMidServerId(requestParams.mid_server);

    progressId = repo.start();

    response.setContentType('application/json');
    response.setBody({
        progressId: progressId
    });
    response.setStatus(202);

})(request, response);
