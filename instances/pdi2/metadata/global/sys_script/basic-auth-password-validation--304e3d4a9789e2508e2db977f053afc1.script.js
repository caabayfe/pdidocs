(function executeRule(current, previous /*null when async*/) {
   var password = current.basic_auth_user_password.getDecryptedValue();
	var minPwdLength = 8;
	var passwdSpecialChars = "@#$%^&*+=!)(_-";
	if (password.length >= minPwdLength && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) &&  /[@#$%^&*+=!)(_-]/.test(password)){
		return;
    }
	gs.addErrorMessage(gs.getMessage("The password does not meet ServiceNow's complexity requirements. It must be at least {0} characters long and include at least one digit, one uppercase letter, one lowercase letter, and one special character from this set {1}", [minPwdLength, passwdSpecialChars]));
	current.setAbortAction(true);

})(current, previous);
