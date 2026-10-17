(function process(request, response) {

    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed)
        VCSAppAccessCheck.throwAccessDenied(appId);

    var requestParams = request.body.data;
	var credential = SourceControlHelper.getAppropriateCredential(requestParams.url, requestParams.credential);
    var progressId, repo;
    repo = sn_vcs.AppSourceControl.updateRepoConfig()
        .setSysRepoConfig(request.pathParams.repoId)
        .setCredential(credential)
        .setURL(requestParams.url)
        .setMidServerId(requestParams.mid_server)
        .setDefaultCommitEmail(requestParams.email)
        .setUseDefaultEmailForAllCommits(requestParams.use_default_email_for_all);

    progressId = repo.start();

    response.setContentType('application/json');
    response.setBody({
        progressId: progressId
    });
    response.setStatus(202);

})(request, response);
