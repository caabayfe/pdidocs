(function executeRule(current, previous /*null when async*/) {

	new UxPageElementInvariants(current)
		.rootVsParentFields(function () {current.setAbortAction(true)}, gs.addErrorMessage);

})(current, previous);
