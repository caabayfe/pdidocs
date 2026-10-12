(function executeRule(current, previous /*null when async*/ ) {
    if (!gs.hasRole('sn_process_mining_power_user')) {
        var error_message = gs.getMessage("Only Power Users and Admins are allowed to create templates");
        gs.addErrorMessage(error_message);
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }
})(current, previous);
