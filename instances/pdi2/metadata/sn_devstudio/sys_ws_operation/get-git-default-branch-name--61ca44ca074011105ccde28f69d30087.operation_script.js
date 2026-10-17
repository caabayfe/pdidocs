(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var appId = request.queryParams.appId ? request.queryParams.appId[0] : '';
	
    if (appId) {
        ScopeCheck.verifyNotGlobal(appId);
        var allowed = VCSAppAccessCheck.verifyVersionControlAccess(appId);

        if (!allowed) 
			VCSAppAccessCheck.throwAccessDenied(appId);
    }

    return sn_vcs.AppSourceControl.getRemoteDefaultBranchName();

})(request, response);
