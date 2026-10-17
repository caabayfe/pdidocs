(function executeRule(current, previous /*null when async*/) {

	// Reload the user from DB which will reset the Avatar Image stored in the cache
	gs.getSession().loadUserByID(gs.getUser().getID());

})(current, previous);
