// Personal Data Verification Type param validation - this runs at the verification param level
// Ensures that the column exists on the sys_user table

check();

function check() {
	if (current.name == 'column') {
		gs.include('PwdVerificationParameterUtility');
		var utility = new PwdVerificationParameterUtility();
		
		var verificationId = current.verification.sys_id;
		var table = "sys_user";
		var column = current.value;
		
		// Check if column exists
		var columnExists = utility.validateColumnExists(table, column);
		if (!columnExists) {
			gs.addErrorMessage(gs.getMessage('The column {0} does not exist on table {1}.', [column, table]));
			current.setAbortAction(true);
			return;
		}
	}
	
}
