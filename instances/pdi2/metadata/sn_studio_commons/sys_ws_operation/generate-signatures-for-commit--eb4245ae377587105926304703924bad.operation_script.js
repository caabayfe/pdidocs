(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var MAX_CHANGED_RECORDS = 1000;

    var appId = request.pathParams.appId;
	ScopeCheck.verifyNotGlobal(appId);

    var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && (VCSAppAccessCheck.verifyPublishAccess(appId) || VCSAppAccessCheck.isGACOrSourceControlUser() || VCSAppAccessCheck.verifyVersionControlAccess(appId));

	if (!allowed)
		VCSAppAccessCheck.throwAccessDenied(appId);

	var changedRecords = request.body.data.changedRecords || [];

	if (changedRecords.length > MAX_CHANGED_RECORDS)
		throw new sn_ws_err.BadRequestError(gs.getMessage('changedRecords exceeds the maximum allowed size of {0}', MAX_CHANGED_RECORDS));

	var generateSignatureCommitEnabled = gs.getProperty('sn_cse.com.snc.csf.generate_signature_commit', 'false') == 'true';

	var result;
	if (generateSignatureCommitEnabled) {
		result = sn_vcs.AppSourceControl.commitOutgoingChanges()
	        .setSysApp(appId)
	        .generateSignaturesForCommit(changedRecords);
	} else {
		result = {
			eligible: false,
			signedCount: 0,
			skippedCount: changedRecords.length,
			signatures: [],
			errors: [],
		};
	}

	response.setContentType('application/json');

	response.setBody({
		eligible: result.eligible,
		signedCount: result.signedCount,
		skippedCount: result.skippedCount,
		signatures: result.signatures,
		errors: result.errors,
	});


})(request, response);
