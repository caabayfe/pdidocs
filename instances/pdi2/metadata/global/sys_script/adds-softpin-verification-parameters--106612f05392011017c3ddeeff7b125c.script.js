(function executeRule(current, previous /*null when async*/) {

	gs.include('PwdVerificationParameterUtility');
	var utility = new PwdVerificationParameterUtility();

	// start fresh if changing type.
	if (!gs.nil(previous) && current.type.sys_id != previous.type.sys_id) {
		utility.clearOthers([]);
	}

	// add the params.
	utility.addParamWithValue('question', "Enter the SoftPIN", 100,
	gs.getMessage("Question for the SoftPIN"));

	utility.addParamWithProperty('pin_length', "password_reset.softpin.min_length", 200,
	gs.getMessage("Minimum number of digits of the SoftPIN"));
	
	utility.addParamWithValue('repetition_threshold', "2", 300,
	gs.getMessage("Threshold for same digit to repeat continuously"));
	
	utility.addParamWithValue('sequence_threshold', "2", 400,
	gs.getMessage("Threshold for sequence of digits"));

})(current, previous);
