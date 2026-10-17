(function executeRule(current, previous /*null when async*/) {
	
	var taggedUsers = current.tagged_users.split(",");

	for(var cnt in taggedUsers){
		gs.eventQueue("promin.note.notify", current, taggedUsers[cnt], gs.getUser().getUserByID(current.sys_updated_by).getFullName());
	}
	
})(current, previous);
