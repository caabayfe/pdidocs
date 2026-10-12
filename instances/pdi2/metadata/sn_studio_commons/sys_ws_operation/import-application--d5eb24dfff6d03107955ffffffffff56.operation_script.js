(function process(request, response) {
    var requestParams, progressId, repo;

    var allowed = VCSAppAccessCheck.verifyCreateAccess();
    if (!allowed)
        VCSAppAccessCheck.throwAccessDenied();

    requestParams = request.body.data;
	
	var credential = SourceControlHelper.getAppropriateCredential(requestParams.url, requestParams.credential);

    repo = sn_vcs.AppSourceControl.registerRepository()
        .setRepositoryURL(requestParams.url)
        .setBranchName(requestParams.branch)
        .setCredential(credential)
        .setTestConnection(!!requestParams.setTestConnection)
        .setDefaultCommitEmail(requestParams.email)
        .setUseDefaultEmailForAllCommits(requestParams.use_default_email_for_all);

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
