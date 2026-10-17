//Exit early
if(!current.source_incident){
	//
}
else
{
	//If there's already an incident alert connected to this incident, prevent the creation
	//This only applies if the incident alert isn't closed
	var incidentAlert = new GlideRecord('incident_alert');
	incidentAlert.addNotNullQuery('source_incident');
	incidentAlert.addQuery('source_incident', current.source_incident);
	incidentAlert.addQuery('state', '!=', 'closed');
	incidentAlert.query();
	while(incidentAlert.next()){
		gs.print(incidentAlert.state);
		current.setAbortAction(true);
		var sysId = incidentAlert.sys_id;

		var incidentAlertNumber = incidentAlert.number;

		var message = "Incident already related to an incident alert: ";
		message += "<a href='incident_alert.do?sys_id=" + sysId + "'>" + incidentAlertNumber;
		message += "</a>";

		gs.addInfoMessage(message);
	}
}
