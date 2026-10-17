(function executeStep(inputs, outputs, stepResult, timeout) {
	var userId = inputs.user;
	var processId = inputs.process;
	
	var enrollMgr = new SNC.PwdEnrollmentManager();
	var processManager = new SNC.PwdProcessManager();
	
	// User does not belong to this process
	if (!enrollMgr.doesUserBelongToProcess(userId, processId)) {
		stepResult.setOutputMessage(gs.getMessage("User {0} does not belong to proces {1}", [userId, processId]));
        stepResult.setFailed();
		return;
	}
	
	var enrolledVers = [];
	var verId;
	
	// Check mandatory verifications
	var mandatoryVers = processManager.getProcessVerificationIdsByMandatoryFlag(processId, true).toArray();
	for (var i = 0; i < mandatoryVers.length; i++) {
		verId = mandatoryVers[i];
		if (!enrollMgr.isUserEnrolledByVerificationId(userId, verId)) {
			stepResult.setOutputMessage(gs.getMessage("User {0} is not enrolled with mandatory verification {1}", [userId, verId]));
            stepResult.setFailed();
		    return;
		}
		enrolledVers.push(verId);
	}
	
	// Check optional verifications
	var optionalVers = processManager.getProcessVerificationIdsByMandatoryFlag(processId, false).toArray();
	for (var j = 0; j < optionalVers.length; j++) {
		verId = optionalVers.get[j];
		if (enrollMgr.isUserEnrolledByVerificationId(userId, verId)) {
			enrolledVers.push(verId);
		}
	}
	
	var process = new SNC.PwdProcess(processId);
	if (enrolledVers.length < process.getMinVerifications()) {
		stepResult.setOutputMessage(gs.getMessage("User {0} is not enrolled with process {1}", [userId, processId]));
        stepResult.setFailed();
		return;
	}
	
	stepResult.setSuccess();
	
	
}(inputs, outputs, stepResult, timeout));
