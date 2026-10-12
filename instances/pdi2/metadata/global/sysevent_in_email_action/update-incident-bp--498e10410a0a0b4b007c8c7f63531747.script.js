gs.include('validators');

if (current.getTableName() == "incident") {
	
	var gr = current;
	
	if (email.subject.toLowerCase().indexOf("please reopen") >= 0)
		gr = new Incident().reopen(gr, email) || gr;
	
	gr.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;
	
	if (gs.hasRole("sn_incident_write") || gs.hasRole("itil")) {
		if (email.body.assign != undefined)
			gr.assigned_to = email.body.assign;
		
		if (email.body.priority != undefined && isNumeric(email.body.priority))
			gr.priority = email.body.priority;
	}
	
	if (gr.canWrite())
		gr.update();
}
