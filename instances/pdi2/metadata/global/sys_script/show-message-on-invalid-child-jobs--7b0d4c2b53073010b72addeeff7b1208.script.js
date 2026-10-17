(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("This is an invalid child job with an empty system_id. The job will be ignored by the system and it will be deleted on system startup."));

})(current, previous);
