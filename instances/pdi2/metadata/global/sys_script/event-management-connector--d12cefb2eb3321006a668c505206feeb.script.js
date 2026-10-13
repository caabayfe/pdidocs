process();

function process() {
	
		
	//defining outside to acces in catch block also
	var probe = "";
	var status = "";
	var lastEvent = "";
	var lastError = "";
	var connectorId = "";
	var last_kpi_signature = "";
	try{
		current.state = 'processing';
		
		// get parameters from payload
		probe = SncProbe.createProbeResponse(current);
		status = probe.getParameter("status");
		lastEvent = probe.getParameter("last_event");
		lastError = probe.getParameter("last_error_message");
		connectorId = probe.getParameter("connector");
		last_kpi_signature = probe.getParameter("last_kpi_signature");
		
		if (probe.getParameter("update_source") == 'true') {
			ConnectorQueue.get().updateSourceAndQueue(connectorId, status, current.getValue("response_to"), lastError, probe.getParameter("action_performed"));
		} else if (probe.getParameter("retrieve_kpi") == 'true') {
			KPIUtil.get().updateKPIResults(connectorId, status, last_kpi_signature, lastError);
			var source = probe.getParameter("metric_source");
			var numberOfProcessedMetrics = probe.getParameter("metric_count");
			var duration = probe.getParameter("metric_duration");
			KPIUtil.get().updatePerformance(source, numberOfProcessedMetrics, duration);
		} else if(probe.getParameter("test") == 'true') {
			var testConUtil = new ConnectorUtil();
			testConUtil.updateTestConnectionStatus(connectorId, status, lastError);	
		} else {
			// update connector
			var conUtil = new ConnectorUtil();
			conUtil.updateConnectorInstance(connectorId, lastEvent, status, lastError);
		}

		// mark the entry processed
		current.state = 'processed';
		current.update();
	}
	catch(e){
		gs.logError("Event Management probe processor failed for ECC queue record " + current.sys_id + " - " + e);
		// Don't want this record to sit in ready state:
		if(current.state != "processed") {
			current.state = "error";
			current.error_string = "Exception during sensor processing: "+e;
			current.update();
		}
		
		//If there is any error in processing ecc_queue input record, we should change the running state of the connector instance so that next run will run properly.
		if ( probe.getParameter("update_source") == 'true'){
			gs.logError("Event Management probe processor failed for update_source ECC queue record " + current.sys_id + " - " + e);
		}
		else if (probe.getParameter("retrieve_kpi") == 'true') {
			var ciGr =  new GlideRecord('em_connector_instance');
			if (ciGr.get(connectorId)) {
				ciGr.setValue('kpi_running', false);
				ciGr.update();
				gs.logError("Setting kpi_running=false for " +ciGr.name+" connector as Event Management probe processor failed for ECC queue record " + current.sys_id + " - " + e);
			}
		} else
		{
			var ciGr =  new GlideRecord('em_connector_instance');
			if (ciGr.get(connectorId)) {
				ciGr.setValue('running', false);
				ciGr.update(); 
				gs.logError("Setting running=false for " +ciGr.name+" connector as Event Management probe processor failed for ECC queue record " + current.sys_id + " - " + e);
			}
		}
	}
}
