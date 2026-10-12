(function executeRule(current, previous /*null when async*/) {

    if (gs.hasRole('password_reset_credential_manager')) {
        // password_reset_credential_manager role → always allow
        return;
    }
    if (gs.hasRole('password_policy_admin') && current.name == 'password_history_limit') {
        // password_policy_admin role → only allow records where name = "password_history_limit"
        return;
    }

	//Abort if password_policy_admin trying to create or modify any param other than password_history_limit
    gs.addErrorMessage("You are not allowed to operate on record where name is not password_history_limit.");
    current.setAbortAction(true);


})(current, previous);
