function /*boolean*/ authorizeSubscribe(/*String*/ channel, /*String*/ user) {
	// Personal channel: only the owning user may subscribe to their own
	// /collabchat/user/<sys_id> channel. gs.getUserID() is the session user's sys_id;
	// the `user` argument is bound to the username, so it can't be compared to the path.
	return channel == "/collabchat/user/" + gs.getUserID();
}
