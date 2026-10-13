function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if(oldValue == newValue && !isLoading) // dont check when reloading the page
		return;
	
	if(g_form.getValue('execute_on') != 'Specific MID Server Cluster')
		return;
	
	// Check that All MID Cluster members contain "EventManagement" application
	var midClusterGr = new GlideRecord('ecc_agent_cluster_member_m2m');
		midClusterGr.addQuery('cluster', g_form.getValue('mid_server_cluster'));
		midClusterGr.query();
	    if(!midClusterGr.hasNext()) {
			g_form.addErrorMessage("MID Cluster does not contain any MID server member");
		}
		while(midClusterGr.next()) {
			if(missingApplication(midClusterGr.agent)) {
				g_form.addErrorMessage("All MID Cluster members should contain the Event Management application.");
				break;
			}
		}
}

// Check that a mid server contain EvenManagement application
function missingApplication(midServerSysId) {
	var ga = new GlideAjax("EmMidUtil");
	ga.addParam('sysparm_name', 'missingApplication');
	ga.addParam('midSysId', midServerSysId);
	ga.getXMLWait();
	var missing = ga.getAnswer();
	if(missing == "true")
		return true;
	return false;
}
