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
}
