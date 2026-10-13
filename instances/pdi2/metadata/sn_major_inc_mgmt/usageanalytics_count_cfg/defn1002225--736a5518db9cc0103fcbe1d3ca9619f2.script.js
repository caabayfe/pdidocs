var meanTTR = 0;
var totalTTRInMins = 0;

var incGr = new GlideRecord("incident");
incGr.setCategory('usage');
incGr.addQuery('sys_created_onRELATIVEGE@dayofweek@ago@30');
incGr.addQuery('state', '>=', 6);
incGr.addQuery('major_incident_state', 'accepted');
incGr.addNotNullQuery('resolved_at');
incGr.query();
var numOfIncidents = incGr.getRowCount();

//Bussiness Duration or difference between resolved and promoted
while (incGr.next()) {
	var openedAt = new GlideDateTime(incGr.getValue('opened_at')).getNumericValue();
	var resolvedOn = new GlideDateTime(incGr.getValue('resolved_at')).getNumericValue();
	if (openedAt && resolvedOn)
		totalTTRInMins += ((resolvedOn - openedAt) / 60000);
}

if (numOfIncidents !== 0)
	meanTTR = totalTTRInMins / numOfIncidents;

answer = Math.round(meanTTR);
