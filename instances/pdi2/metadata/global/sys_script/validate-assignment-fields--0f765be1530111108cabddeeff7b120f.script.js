(function executeRule(current, previous /*null when async*/) {
	
if(current.user && current.user_group){
	gs.addErrorMessage(gs.getMessage("Invalid policy assignment state! Task Assignment Group and Task Assignment User both cannot be active for a policy record"));
	current.setAbortAction(true);
}

})(current, previous);
