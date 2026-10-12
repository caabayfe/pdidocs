(function executeRule(current, previous /*null when async*/ ) {

    if (!gs.hasRole("sn_process_mining_power_user")) {
        current.setAbortAction(true);
        gs.setRedirect(current);
        gs.addErrorMessage(gs.getMessage("You are not allowed to create/update this Finding Def. Please contact system administrator to get sn_process_mining_power_user role"));
    }

})(current, previous);
