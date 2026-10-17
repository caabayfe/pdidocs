// populate the default value for the caller
function incidentGetViewName() {
  if (gs.hasRole("itil") || gs.hasRole("sn_incident_read")) 
     return; 
  if (view.startsWith("ess"))
     return;
  if (view == "sys_ref_list")
     return;

  answer = "ess";
}

function incident_listGetViewName() {
  incidentGetViewName();
}

// for ESS type users, use the logged in user
// for itil users, if the parent had a user, use that person
function incidentGetCaller() {
	if (gs.hasRole("itil") || gs.hasRole("sn_service_desk_agent")) {
		var action = gs.action;
		var table = action.get("sysparm_collection");
		if (table != "sys_user")
			return null;

		var userID = action.get("sysparm_collectionID");
		return userID;
	}

	return gs.getUserID();
}

// get an email address from the sys_user file
function sys_userGetEmailAddress(sys_id) {
	// danger, at this point, the current record switches to sys_user
	var prev = current;
	var emailAddress = null;
	var user = new GlideRecord("sys_user");
	user.addQuery("sys_id", sys_id);
	user.query();
	if (user.next()) {
                                if (user.notification == 2) 
		   emailAddress = user.email;
	}

	current = prev;
	return emailAddress;
}
