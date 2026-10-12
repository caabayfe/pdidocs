(function process(request, response) {
	var appId = request.pathParams.appId;
	
	ScopeCheck.verifyNotGlobal(appId);
    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed)
        VCSAppAccessCheck.throwAccessDenied(appId);

	var requestParams = request.body.data;
	var stashMessage = requestParams.stashMessage || '';

	var progressId, repo;
	repo = sn_vcs.AppSourceControl
		.applyIncomingChanges()
		.setSysApp(appId)
		.setStashMessage(stashMessage)
		.setExecuteEvenIfHasOutgoingChanges(true)
		.setExecuteEvenIfHasNoIncomingChanges(true)
		.setPreserveOutgoingChanges(requestParams.preserveLocalChanges);

	if (requestParams.hasOwnProperty("upgradeBaseApp"))
		repo.setUpgradeVendorApp(requestParams.upgradeBaseApp);

	progressId = repo.start();

	response.setContentType('application/json');
	response.setBody({
		progressId: progressId
	});
	response.setStatus(202);  
	
})(request, response);
