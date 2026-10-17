// Get the password to be tested.
var testPassword = current.password.getDecryptedValue();

// Check if update is successful or not, if successful, then test the password
var updated = current.update();
if (updated) {
    var isValid = SNC.PasswordPolicyEvaluator.isValidPwdPerPolicy(testPassword, current.sys_id);
    if (isValid) {
        gs.addInfoMessage(gs.getMessage("Password is valid."));
    } else {
        gs.addErrorMessage(gs.getMessage("Password is invalid."));
    }

    action.setRedirectURL(current);
}
