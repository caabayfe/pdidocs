gs.include('validators');

if (current.getTableName() == "change_request") {
	current.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;
	
	if (gs.hasRole("itil, sn_change_write")) {
		if (email.body.assign != undefined)
			current.assigned_to = email.body.assign;
		
		if (email.body.priority != undefined && isNumeric(email.body.priority))
			current.priority = email.body.priority;
	}

	if (current.canWrite())
		current.update();
}
