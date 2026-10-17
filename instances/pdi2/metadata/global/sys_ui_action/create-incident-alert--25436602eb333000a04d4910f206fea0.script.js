var ia = new GlideRecord("incident_alert");
ia.short_description = current.short_description;
ia.source_ci = current.cmdb_ci;
ia.source_incident = current.sys_id;
var notes = current.work_notes.getDisplayValue();
var comnt = current.comments.getDisplayValue();
//Create summary of the Incident to be added to work notes of the Incident Alert
var summary = "Source Incident Details\n\nNumber: " + current.number + "\nCaller: " + current.caller_id.name 
	+ "\nConfiguration item: " + current.cmdb_ci.name + "\nDuration: " + current.calendar_duration.getDisplayValue() 
	+ "\nOpened: " + current.opened_at + "\nOpened by: " + current.opened_by.name + "\nResolved: " + current.resolved_at 
	+ "\nShort description:" + current.short_description + "\n\n" + comnt + notes;

ia.background = summary;

//Check if there's not already an incident alert with this incident
var iaCheck = new GlideRecord('incident_alert');
iaCheck.addQuery('source_incident', current.sys_id);
iaCheck.query();

if(iaCheck.hasNext()){	
	iaCheck.next();
	var sysId = iaCheck.sys_id;

	var url = "incident_alert.do?sys_id=" + sysId;
	gs.print(url);
	action.setRedirectURL(url);
	var message = gs.getMessage("Incident Alert already created for this incident. You were routed to it");
	gs.addInfoMessage(message);
}
else
{
	var sysID = ia.insert();
	
	//current.problem_id = sysID;
	var mySysID = current.update();
	var message = gs.getMessage("Incident alert {0} created",ia.number);
	gs.addInfoMessage(message);
	action.setRedirectURL(ia);
	action.setReturnURL(current);
}
