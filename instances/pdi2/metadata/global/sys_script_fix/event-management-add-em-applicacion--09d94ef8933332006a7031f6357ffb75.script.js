var trapGr = new GlideRecord("ecc_agent_ext_context_trap");
trapGr.query();
while(trapGr.next()) {
	var emMidUtil = new EmMidUtil();
    if(trapGr.execute_on == "Specific MID Server") {
	    if(GlideStringUtil.notNil(trapGr.mid_server)) {
		   // Check if ALL or EventManagement application assign to this MID
	       if(emMidUtil.missingApplication(trapGr.mid_server))
	    		setEMApp(trapGr.mid_server);
        }
     } else if (GlideStringUtil.notNil(trapGr.mid_server_cluster)) {
        var midClusterGr = new GlideRecord('ecc_agent_cluster_member_m2m');
        midClusterGr.addQuery('cluster', trapGr.mid_server_cluster);
        midClusterGr.query();
       
	   while(midClusterGr.next()) {
			if(emMidUtil.missingApplication(midClusterGr.agent))
				// Check if ALL or EventManagement application assign to this MID
				setEMApp(midClusterGr.agent);
		}
     }
}
 
// Set EventManagement application on a given MID
function setEMApp(midServerId) {
    var appGr = new GlideRecord('ecc_agent_application_m2m');
	appGr.setValue('application', 'ed76c5d0d7202200bdbaee5b5e6103d9'); //"ALL" or "EventManagement" app
	appGr.setValue('agent', midServerId);
	appGr.insert();
}  
