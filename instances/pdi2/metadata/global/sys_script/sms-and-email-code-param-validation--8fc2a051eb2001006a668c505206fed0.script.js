// SMS Code Verification Type
// parameter validations

check();

function check() {
	gs.include('PwdVerificationParameterUtility');
	var utility = new PwdVerificationParameterUtility();
	
	// all params are integers:
	var paramList = ['complexity', 'expiry', 'pause_window', 'max_per_day'];	
	if (utility.contains(paramList, current.name) && !utility.isInteger(current.value)) {
		gs.addErrorMessage(gs.getMessage('pwd_integer_required', current.name));
		current.setAbortAction(true);
		return;
	}
	
	// Specific check for expiry:
	if (current.name == 'expiry') {
		var requestExpiry = GlideProperties.get("password_reset.request.expiry", '0');
		assertGreaterOrEqual(requestExpiry, current.value, gs.getMessage('pwd_cannot_be_greater_than', [current.name, requestExpiry]));
		assertGreaterOrEqual(current.value, '0', gs.getMessage('pwd_non_negative', [current.name]));
	}
	
	// Specific check for complexity:
	if (current.name == 'complexity') {
		var MAX_VALUE = 10;
		const MIN_VALUE = 4;
		assertGreaterOrEqual(MAX_VALUE, current.value, gs.getMessage('pwd_cannot_be_greater_than', [current.name, MAX_VALUE]));
		assertGreaterOrEqual(current.value, MIN_VALUE, gs.getMessage('pwd_cannot_be_less_than', [current.name, MIN_VALUE]));
	}
	
	// Specific check for pause_window:
	if (current.name == 'pause_window') {
		var MAX_VALUE = 100;
		assertGreaterOrEqual(MAX_VALUE, current.value, gs.getMessage('pwd_cannot_be_greater_than', [current.name, MAX_VALUE]));
		assertGreaterOrEqual(current.value, '0', gs.getMessage('pwd_non_negative', [current.name]));
	}
	
	// Specific check for max_per_day:
	if (current.name == 'max_per_day') {
		var MAX_VALUE = 100;
		assertGreaterOrEqual(MAX_VALUE, current.value, gs.getMessage('pwd_cannot_be_greater_than', [current.name, MAX_VALUE]));
		assertGreaterOrEqual(current.value, '0', gs.getMessage('pwd_non_negative', [current.name]));
	}
}



function assertGreaterOrEqual(propLarger, propSmaller, errMsg) {
	if (parseInt(propLarger) < parseInt(propSmaller)){
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
}
