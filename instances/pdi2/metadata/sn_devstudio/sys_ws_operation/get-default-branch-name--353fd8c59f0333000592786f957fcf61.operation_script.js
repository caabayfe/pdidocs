(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var appId = request.queryParams.appId ? request.queryParams.appId[0] : '';
	
    if (appId) {
		// Testing for AES VCS only when appId is available
        ScopeCheck.verifyNotGlobal(appId);
        var allowed = VCSAppAccessCheck.verifyVersionControlAccess(appId);

        if (!allowed) 
			VCSAppAccessCheck.throwAccessDenied(appId);
    }

    return sn_vcs.AppSourceControl.getDefaultBranchName();

})(request, response);
