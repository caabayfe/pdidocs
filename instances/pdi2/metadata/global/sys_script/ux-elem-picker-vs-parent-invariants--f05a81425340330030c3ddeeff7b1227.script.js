(function executeRule(current, previous /*null when async*/) {

	new UxPageElementInvariants(current)
		.pickerVsParentFields(function () {current.setAbortAction(true)}, gs.addErrorMessage);

})(current, previous);
