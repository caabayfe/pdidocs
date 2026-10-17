// Open a list of outages for this CI
var relatedOutagesString;
var lowerBoundProperty = 'cmdb.recent_outages.days_ago';
var higherBoundProperty = 'cmdb.recent_outages.days_ahead';
var relatedOutages = new GlideRecord('cmdb_outage_ci_mtom');
relatedOutages.addQuery('ci_item', item.id);
relatedOutages.query();
while(relatedOutages.next()) {
	if (relatedOutagesString)
		relatedOutagesString = relatedOutagesString + ',' + relatedOutages.getValue('outage');
	else
		relatedOutagesString = relatedOutages.getValue('outage');
}
var lowerBoundDays;
var higherBoundDays;
var boundDays = new GlideRecord('sys_properties');
boundDays.addQuery('name','IN',lowerBoundProperty+','+higherBoundProperty);
boundDays.query();
while (boundDays.next()) {
	var currentProp = boundDays.getValue('name');
	if(currentProp === lowerBoundProperty)
		lowerBoundDays = boundDays.getValue('value');
	else 
		higherBoundDays = boundDays.getValue('value');
	
	if (!lowerBoundDays)
		lowerBoundDays = '7';
	if (!higherBoundDays)
		higherBoundDays= '14';	
}

if (relatedOutagesString) {	
	window.g_navigation.open('/cmdb_ci_outage_list.do?sysparm_query=endRELATIVEGE@dayofweek@ago@'+lowerBoundDays+'%5EORendISEMPTY%5EbeginRELATIVELE@dayofweek@ahead@'+higherBoundDays+'%5Ecmdb_ci='+ item.id +'%5EORsys_idIN' + relatedOutagesString,'_blank');
}
else
	window.open('/cmdb_ci_outage_list.do?sysparm_query=endRELATIVEGE@dayofweek@ago@'+lowerBoundDays+'%5EORendISEMPTY%5EbeginRELATIVELE@dayofweek@ahead@'+higherBoundDays+'%5Ecmdb_ci=' + item.id);
