(function executeRule(current, previous /*null when async*/) {

	if(gs.nil(current.session_id))
		current.session_id = gs.getSessionID();
	if(gs.nil(current.user))
		current.user = gs.getUserID();
		
})(current, previous);
