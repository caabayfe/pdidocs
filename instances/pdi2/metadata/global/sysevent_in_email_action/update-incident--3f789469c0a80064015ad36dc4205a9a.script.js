gs.include('validators');

if (current.getTableName() == "incident") {
	current.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;
	
	if (gs.hasRole("sn_incident_write") || gs.hasRole("itil")) {
		if (email.body.assign != undefined)
			current.assigned_to = email.body.assign;
		
		if (email.body.priority != undefined && isNumeric(email.body.priority))
			current.priority = email.body.priority;
	}

	if (current.canWrite())
		current.update();
}
