// This script is invoked during the password reset step and is used to
// ensure that the new password is in compliance with password policy.

function isPasswordValid(password) {
	var valid = SNC.PasswordResetUtil.validateStrongerPassword(password);
	return (valid == "true"); 
}
