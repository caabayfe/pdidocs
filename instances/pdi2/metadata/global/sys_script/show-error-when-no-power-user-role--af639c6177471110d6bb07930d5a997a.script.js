(function executeRule(current, previous /*null when async*/ ) {

    if (!gs.hasRole("sn_process_mining_power_user")) {
        current.setAbortAction(true);
        gs.setRedirect(current);
        gs.addErrorMessage(gs.getMessage("You are not allowed to create/update this Finding Def. Please contact system administrator to get sn_process_mining_power_user role"));
    }
	if(!current.process_def.getRefRecord().canWrite()) {
		current.setAbortAction(true);
        gs.setRedirect(current);
        gs.addErrorMessage(gs.getMessage("You are not allowed to create/update this Finding Definition as it belongs to Content pack"));
	}

})(current, previous);
