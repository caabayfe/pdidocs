// Personal Data Verification Type
// add default parameters if there is not already
handleDefaults();

function handleDefaults() {	
	gs.include('PwdVerificationParameterUtility');

	var utility = new PwdVerificationParameterUtility();
	// start fresh if changing type.
	if (!gs.nil(previous) && current.type.sys_id != previous.type.sys_id) {
		utility.clearOthers(['label', 'column']);
	}
	// add the params.
	utility.addParamWithValue('label', "User ID", 100, 
  	  gs.getMessage('Label that the user sees while requesting password reset'));
	utility.addParamWithValue('column', "user_name", 200, 
		gs.getMessage("Column of the sys_user table that is used to verify the user's identity")); 					  

}
