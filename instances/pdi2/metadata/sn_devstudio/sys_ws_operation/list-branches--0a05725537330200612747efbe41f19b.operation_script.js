(function process(request, response) {
    var appId = request.pathParams.appId;
	
	ScopeCheck.verifyNotGlobal(appId);
	
	var allowed = VCSAppAccessCheck.verifyReadAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);
	
	var repo = sn_vcs.AppSourceControl.getRepository(appId),
		branches = repo.getBranches(),
		result = [];
	
	while (branches && branches.next()) {
		result.push({
			appId: appId,
			repoId: branches.getSysRepoConfigSysId(),
			name: branches.getName(),
			isCurrent: branches.isCurrent(),
			headCommit: branches.getHeadCommit()
		});
	} 
	
	response.setBody({
		count: result.length,
		branches: result
	});

	response.setStatus(200);
	response.setContentType('application/json');

})(request, response);
