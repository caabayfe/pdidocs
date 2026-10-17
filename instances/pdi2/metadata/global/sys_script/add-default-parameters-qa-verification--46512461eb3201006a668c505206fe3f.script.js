// Security Questions Verification Type
// add default parameters if there is not already
handleDefaults();

function handleDefaults() {	
	gs.include('PwdVerificationParameterUtility');

	var utility = new PwdVerificationParameterUtility();
	// start fresh if changing type.
	if (!gs.nil(previous) && current.type.sys_id != previous.type.sys_id) {
		utility.clearOthers(['num_enroll', 'num_reset']);
	}
	// add the params.
	utility.addParamWithProperty('num_enroll', "password_reset.qa.num_enroll", 100, 
				gs.getMessage('Number of security questions to display while user is enrolling for the Password Reset service'));
	utility.addParamWithProperty('num_reset', "password_reset.qa.num_reset", 200, 
				gs.getMessage('Number of security questions to display while user is requesting password reset'));
}
