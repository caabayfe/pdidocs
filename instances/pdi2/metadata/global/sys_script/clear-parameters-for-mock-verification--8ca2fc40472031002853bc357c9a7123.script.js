// Mock Verification Type
// Clear parameters if any, no default parameters for mock verification type
handleDefaults();

function handleDefaults() {
	gs.include('PwdVerificationParameterUtility');
	var utility = new PwdVerificationParameterUtility();
	// Clear all the parameters
	utility.clearOthers([]);
	
}
