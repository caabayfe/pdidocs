function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	var needToUpdate = false;
	if(oldValue == newValue && !isLoading) // action is "on change" but there is no real change
		return;
	
	var gr = new GlideRecord('ecc_agent_ext_context_webserver');
	gr.get(newValue);
	
	// Check that the MID server that assign to the MID web server extension contain "EventManagement" application
	if (gr.execute_on == "Specific MID Server") {
		if(missingApplication(gr.mid_server)) {
			g_form.addErrorMessage("The MID Server, that runs the MID Web Server Extension, should contain the Event Management application.");
			needToUpdate = true;
		}
	} else { // MID cluster:  we should check that all its MID's members contain "EventManagement" application
		var midClusterGr = new GlideRecord('ecc_agent_cluster_member_m2m');
		midClusterGr.addQuery('cluster', gr.mid_server_cluster);
		midClusterGr.query();
		while(midClusterGr.next()) {
			if(missingApplication(midClusterGr.agent)) {
				g_form.addErrorMessage("All MID Cluster members, that runs on the MID Web Server Extension, should contain the Event Management application.");
				needToUpdate = true;
				break;
			}
		}
	}
	
	if(!isLoading) { // On change: change the MID server extension to the previous value
		if(needToUpdate)
			g_form.setValue('web_ext',oldValue);
		else {
			// Update the MID server with current extension
			g_form.setValue('mid_server',gr.mid_server);
			g_form.setValue('mid_server_cluster',gr.mid_server_cluster);
			g_form.setValue('execute_on',gr.execute_on);
		}
	}
}

// Check that a mid server contain EvenManagement application
function missingApplication(midServerSysId) {
	if(midServerSysId == null || midServerSysId == "") //Should not happen
		return false;
	
	var appGr = new GlideRecord('ecc_agent_application_m2m');
	appGr.addQuery('application', 'IN', '35aa573fd7802200bdbaee5b5e610375,ed76c5d0d7202200bdbaee5b5e6103d9'); //"ALL" or "EventManagement" app
	appGr.addQuery('agent', midServerSysId);
	appGr.query();
	if(appGr.next())
		return false;
	return true;
}
