function onAfter(current, previous) {
    var gr = new GlideRecord('sa_deferred_service_discovery');
    gr.addQuery('discovery_status',current.status);
    gr.query();
    if (gr.next()) {
        gs.print("Deferred Service Discovery found");
        var clientId = gr.getValue('client_id');
        var dh = new SNC.DomainHelper();
        var entryPointId = gr.getValue('entry_point');
        dh.adjustDomainByCiSysId(entryPointId);
        if (clientId != null) {
            if(current.status.state !== "Completed")
		        return;
            var patternDebuggerManager = new SNC.PatternDebuggerManager();
            patternDebuggerManager.handleHostDetectionResult(gr.getUniqueValue(),clientId);
        } 
        else {
			// if last state is Active, Windows Cluster VIP, we need to trigger the probe that
			// finds physical IPs and do some maintenance of relevant tables
			if (current.last_state == 'Active, Windows Cluster VIP') {
				gs.print("Cluster VIP identified: " + gr.getValue('ip_address'));
				// duplicate the relevant record in sa_deferred_service_discovery
				gs.print("Inserting new record to sa_deferred_service_discovery for IP " + gr.getValue('ip_address'));
				var newSaDefferedStatus = new GlideRecord('sa_deferred_service_discovery');
				newSaDefferedStatus.setValue('entry_point',gr.getValue('entry_point'));
				newSaDefferedStatus.setValue('additional_parameters',gr.getValue('additional_parameters'));
				newSaDefferedStatus.setValue('ip_address',gr.getValue('ip_address'));
				var newRecord = newSaDefferedStatus.insert();
				gs.print("New record inserted to sa_deferred_service_discovery");
				// clear the discovery status field in sa_endpoint_status
				var saEndpointStatus = new GlideRecord("sa_endpoint_status");
				saEndpointStatus.addQuery("endpoint_id",gr.getValue("entry_point"));
				saEndpointStatus.query();
				if (saEndpointStatus.next()) {
					gs.print("Updating the sa_endpoint_status table entry of endpoint: " + gr.getValue("entry_point"));
					saEndpointStatus.setValue("discovery_status", null);
					saEndpointStatus.update();
				    
					// launch the probe that finds physical IPs
					
					// Use the common MID selector to find MID
					var selector = new CommonMIDServerSelector();
					var mid = selector.findAgent(gr.getValue('ip_address'), null, 'ServiceMapping');
					
					// If MID is not found, return
					if (mid == null) {
					    gs.log("No MID server found for IP " + gr.getValue('ip_address'));
					    saEndpointStatus.setValue("error", "No MID server found for IP " + gr.getValue('ip_address'));
					    saEndpointStatus.update();
					    gr.deleteRecord();
					    dh.restoreCurrentSessionParams();
                        return;
					}

					var midServer = "mid.server." + mid;
					
					var discoveryStatusGr = new GlideRecord("discovery_status");
					// GlideRecord.get 1 arg form falls back to 'name' if not found by sys_id, 2 arg form throws exception if arg2 is null.
					if (current.status)
						discoveryStatusGr.get('sys_id', current.status);
					if (discoveryStatusGr.isValid()) {
						gs.print("Launching probe: Windows - Get Physical Address for VIP");
						var probe = new SncProbe.get('Windows - Get Physical Address for VIP');
						probe.setSource(gr.getValue('ip_address'));
						probe.addParameter("endpoint_id", gr.getValue("entry_point"));
						probe.addParameter("deferred", newRecord);
						probe.setTopic('WMIRunner');
						probe.create(midServer);
					}
				}
				
				// Delete the old record
				gr.deleteRecord();
				
			}
            // var discoveryRunner = new SNC.ServiceWatchTaskManager();
            // For now we do not report on discovery completion at this point since it created identity matching collisions with horizontal discovery.
            // discoveryRunner.startDeferredDiscovery(gr.getUniqueValue(), current.status);
        }
        dh.restoreCurrentSessionParams();

    }
 	
	
}
