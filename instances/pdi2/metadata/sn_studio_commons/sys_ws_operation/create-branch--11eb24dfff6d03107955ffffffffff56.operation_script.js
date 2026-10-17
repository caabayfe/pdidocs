(function process(request, response) {
	var appId = request.pathParams.appId;
	
	ScopeCheck.verifyNotGlobal(appId);
	var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);
	
	var requestParams = request.body.data;
	var worker = sn_vcs.AppSourceControl.createBranch()
			.setSysApp(appId)
			.setBranchName(requestParams.branchName)
			.setStashMessage(requestParams.stashMessage)
			.setPreserveLocalChanges(requestParams.preserveLocalChanges);

	if (typeof requestParams.tagName !== 'undefined')
		worker.setBranchFromTag(requestParams.tagName);

	response.setContentType('application/json');
	response.setBody({
		progressId: worker.start()
	});
	response.setStatus(202);

})(request, response);
