// Security Questions Verification Type parameter validations

// num_enroll > 0
// num_reset > 0
// num_reset <= num_enroll

check();

function check() {
	gs.include('PwdVerificationParameterUtility');
	var utility = new PwdVerificationParameterUtility();
		
	
	// all params are positive integers:
	var paramList = ['num_reset', 'num_enroll'];
	if (utility.contains(paramList, current.name) && !utility.isPositiveInteger(current.value)) {
		gs.addErrorMessage(gs.getMessage('[{0}] must be a positive integer', current.name));
		current.setAbortAction(true);
		return;
	}
	
	// Specific check for num_reset:
	if (current.name == 'num_reset') {
		var enroll = getParameterValue('num_enroll');
		var enrollSource = 'num_enroll';
		if (enroll == null) {
			var prop = "password_reset.qa.num_enroll";
			enroll = GlideProperties.get(prop,'0');
			enrollSource = 'Property: password_reset.qa.num_enroll';
		}
		var message = gs.getMessage('pwd_cannot_be_greater_than', ['num_reset', enrollSource]);
		message += gs.getMessage('If you are trying to change both values, change one value at a time');
		assertGreaterOrEqual(enroll, current.value, message);
	}
	
	// Specific check for num_enroll:
	if (current.name == 'num_enroll') {
		var MAX_ENROLL = 20;
		var reset = getParameterValue('num_reset');
		var resetSource = 'num_reset';
		if (reset == null) {
			var prop = "password_reset.qa.num_reset";
			reset = Math.max(1, GlideProperties.get(prop,'0'));
			resetSource = 'Property: password_reset.qa.num_reset';
		}
		var numEnrollMessage = gs.getMessage('pwd_cannot_be_less_than', ['num_enroll', resetSource]);
		numEnrollMessage += gs.getMessage(' If you are trying to change both values, change one value at a time');
		assertGreaterOrEqual(current.value, reset, numEnrollMessage);
		assertGreaterOrEqual(MAX_ENROLL, current.value, gs.getMessage('pwd_cannot_be_greater_than', ['num_enroll', '20']));
	}
	
}


function getParameterValue(param) {
	var ret = null;
	var paramGr = new GlideRecord('pwd_verification_param');
	paramGr.addQuery('verification', current.verification.sys_id);
	paramGr.addQuery('name', param);
	paramGr.query();
	if (paramGr.next()) {
		ret = paramGr.getValue('value');
	}
	paramGr.close();
	return ret;
}

function assertGreaterOrEqual(propLarger, propSmaller, errMsg) {
	if (parseInt(propLarger) < parseInt(propSmaller)) {
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
}
