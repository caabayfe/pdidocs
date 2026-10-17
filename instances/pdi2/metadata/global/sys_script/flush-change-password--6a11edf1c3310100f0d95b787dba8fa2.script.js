invalidateUserSessions();

function invalidateUserSessions(){
	var sessionID = gs.getSessionID();
	var userID = current.user_name;
	var userSession = new GlideRecord('v_user_session');
	userSession.addQuery('user', userID);
	userSession.addQuery('session_id', '!=', sessionID);
	userSession.query();
	while (userSession.next()) {
        gs.log("Invalidating user session : " + userSession.session_id + " : owing to a password change!");
        userSession.locked = true;
        userSession.update();
	}
	//--defect fix --DEF0539504
	//This change is done to make sure the sessions for the user whose password is getting changed is locked out
	//first and then eventually log out the user from all the other nodes as well apart from the current node
	var decodeFlag = "decode64flag:";
	var encodedUsername = GlideStringUtil.base64Encode(userID);
	GlideClusterMessage.postScript("GlideSessions.lockOutSessions('" + decodeFlag + encodedUsername + "');");
}
