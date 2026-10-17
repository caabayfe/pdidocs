function resolveIncident(){
	//Set the 'Incident state' and 'State' values to 'Resolved', and display mandatory fields
	g_form.setValue('incident_state', 6);
	g_form.setValue('state', 6);
	g_form.setValue('resolved_by', g_user.userID);
	
	gsftSubmit(null, g_form.getFormElement(), 'resolve_incident'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
	serverResolve();

function serverResolve(){
	current.incident_state = IncidentState.RESOLVED;
	current.state = IncidentState.RESOLVED;
	current.resolved_by = gs.getUserID();
	current.update();
}
