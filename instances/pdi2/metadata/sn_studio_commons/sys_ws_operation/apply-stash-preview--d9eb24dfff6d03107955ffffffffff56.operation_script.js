(function process(request, response) {
    var appId = request.pathParams.appId;

    ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var repo = sn_vcs.AppSourceControl.getRepository(appId),
        preview = repo.getCurrentStashPreview(),
        updates = preview.getUpdates();

    function userDecisionExists(updateId) {
        return _.find(request.body.data.decisions, function(dec) {
            return dec.updateId === updateId;
        });
    }
	
	function previewProblemResolved(decision) {
		var gr = new GlideRecord("sys_update_preview_problem");
		gr.addQuery("remote_update.sys_id", updates.getSysId());
		gr.addNotNullQuery("status");
		gr.query();
		return gr.next();
	}

    var decision;
    var acceptStashedChanges = gs.getProperty('sn_devstudio.vcs.accept_stashed_changes', 'false') == 'true';
    while (updates.next()) {
        decision = userDecisionExists(updates.getSysId());

        if (decision && decision.updateId)
            updates.setSkip(!!decision.setSkip);
        else if (!previewProblemResolved(updates))
            updates.setSkip(!acceptStashedChanges);
    }

    var progressId = repo.workers()
        .commitStashPreview()
        .start();

    response.setContentType('application/json');
    response.setBody({
        progressId: progressId
    });
    response.setStatus(202);

})(request, response);
