(function executeRule(current, previous /*null when async*/) {

	//MFA enforcement related info message will be displayed when user navigates to their profile section
	SNC.MultifactorAuthUtil.showMFAEnforcementMessageIfNeeded();

})(current, previous);
