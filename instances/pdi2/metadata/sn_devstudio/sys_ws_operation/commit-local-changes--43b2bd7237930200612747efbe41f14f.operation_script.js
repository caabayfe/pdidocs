(function process(request, response) {

    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.verifyPublishAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var progressId = sn_vcs.AppSourceControl.commitOutgoingChanges()
        .setSysApp(appId)
        .setCommitMessage(request.body.data.commitMessage || '')
        .setCommitMode(request.body.data.commitMode || '')
        .setListOfFilesToBeCommited(request.body.data.changedRecords || [])
        .start();

    response.setContentType('application/json');

	response.setBody({
		progressId: progressId
	});
	response.setStatus(202);

})(request, response);
