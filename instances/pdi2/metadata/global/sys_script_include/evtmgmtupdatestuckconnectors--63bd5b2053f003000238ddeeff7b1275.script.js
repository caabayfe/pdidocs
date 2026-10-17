var EvtMgmtUpdateStuckConnectors = Class.create();
EvtMgmtUpdateStuckConnectors.prototype = {
	initialize: function() {
	},
	
	type: 'EvtMgmtUpdateStuckConnectors'
};

EvtMgmtUpdateStuckConnectors.updateStuckConnectors = function() {
	var TIME_PERIOD_RUNNING_CONNECTORS = gs.getProperty("evt_mgmt.stuck_connectors_running_time", "-120"); //2 minutes
	var TIMEOUT_STUCK_CONNECTORS = gs.getProperty("evt_mgmt.stuck_connectors_timeout", "-7200"); //2 hours
	
	//get all connectors that are running more than 2 minutes
	
	var eventConnectorsToCheck = {};
		var eventConnectorsToUpdate = [];
		
		var kpiConnectorsToCheck = {};
			var kpiConnectorsToUpdate = [];
			
			var timeout = new GlideDateTime();
			timeout.addSeconds(TIMEOUT_STUCK_CONNECTORS);
			
			// Get Runnig events connectors
			connGr = getRunning("running", "last_run_time");
			getRunningConnectorsToCheck(connGr, eventConnectorsToUpdate,  eventConnectorsToCheck, "last_run_time", timeout);
			
			// Get Runnig KPI connectors
			connGr = getRunning("kpi_running", "kpi_last_run_time");
			getRunningMetricConnectorsToCheck(connGr, kpiConnectorsToUpdate,  "kpi_last_run_time");
			
			
			gs.debug("Update stuck connectors: eventConnectorsToUpdate: " + eventConnectorsToUpdate.length + " eventConnectorsToCheck: " + Object.keys(eventConnectorsToCheck).length);
			gs.debug("Update stuck connectors: KPI kpiConnectorsToUpdate: " + kpiConnectorsToUpdate.length + " kpiConnectorsToCheck: " + Object.keys(kpiConnectorsToCheck).length);
			
			if (Object.keys(eventConnectorsToCheck).length > 0 || Object.keys(kpiConnectorsToCheck).length > 0) {
				//search for all failed records from the last 2 hours
				var eccGr = new GlideRecord("ecc_queue");
				eccGr.addQuery("topic","ConnectorProbe");
				eccGr.addQuery("queue", "output");
				eccGr.addQuery("state", "error");
				eccGr.addQuery("sys_updated_on", ">=", timeout);
				eccGr.addQuery("sys_created_on", ">=", timeout);
				eccGr.query();
				while (eccGr.next()) {
					gs.debug("Update stuck connectors: found error in ecc_queue");
					var json = SncProbe.getJsonPayload(eccGr);
					var param = json["parameter"];
					for (var i in param) {
						if (param[i]["@name"] === "connector") {
							var currentConnector = param[i]["@value"];
							//if the specific connector is also running more than 2 minutes -> remove it from running mode
							if(checkIfKpiRunning(param) == true) {
								gs.debug("Update stuck connectors: CONNECTORS: KPI ERROR");
								if (kpiConnectorsToCheck[currentConnector])
									kpiConnectorsToUpdate.push(currentConnector);
							} else  if (eventConnectorsToCheck[currentConnector]) {
								gs.debug("Update stuck connectors: EVENTS ERROR");
								eventConnectorsToUpdate.push(currentConnector);
							}
						}
					}
				}
			}
			
			// Set event connectors running
			if (eventConnectorsToUpdate.length > 0) {
				gs.error("Scheduled job 'Update stuck connectors': release stuck event connectors after error or timeout. Remove the following connectors from running mode: " + eventConnectorsToUpdate);
				var gr = new GlideRecord("em_connector_instance");
				gr.addQuery("sys_id", "IN", eventConnectorsToUpdate);
				gr.setValue("running", false);
				gr.setValue("last_status", "Error");
				gr.setValue("last_error_message", "Connector was stuck and released by the \"Event Management - Update stuck connectors\" job");
				var now = new GlideDateTime();
				gr.setValue("last_run_time", now);
				gr.updateMultiple();
			} else {
				gs.debug("Update stuck connectors: no need to update event connectors");
			}
			
			// Set KPI connectors running
			if (kpiConnectorsToUpdate.length > 0) {
				gs.error("Scheduled job 'Update stuck connectors': release stuck KPI connectors after error or timeout. Remove the following connectors from running mode: " + kpiConnectorsToUpdate);
				var gr = new GlideRecord("em_connector_instance");
				gr.addQuery("sys_id", "IN", kpiConnectorsToUpdate);
				gr.setValue("kpi_running", false);
				gr.setValue("last_kpi_status", "Error");
				var now = new GlideDateTime();
				gr.setValue("kpi_last_run_time", now);
				gr.updateMultiple();
			} else {
				gs.debug("Update stuck connectors: no need to update kpi connectors");
			}
			
			//Catch the jobs that have been created automaticlly due to async business rule on ecc queue table and mark them as upgrade safe
			supportConnectorsUpgradeSafe();
			
			updateFutureScheduleConnectors("last_run_time");
			updateFutureScheduleConnectors("kpi_last_run_time");
			
			function getRunning(runningFieldName,  lastRunTimeFieldName) {
				var connGr = new GlideRecord("em_connector_instance");
				connGr.addQuery("active", true);
				connGr.addQuery(runningFieldName, true);
				var runningTime = new GlideDateTime();
				runningTime.addSeconds(TIME_PERIOD_RUNNING_CONNECTORS);
				connGr.addQuery(lastRunTimeFieldName, "<=", runningTime);
				connGr.query();
				return connGr;
			}
			
			function updateFutureScheduleConnectors(lastRunTimeFieldName) {
				var connGr = new GlideRecord("em_connector_instance");
				var nowTime = new GlideDateTime();
				connGr.addQuery(lastRunTimeFieldName, ">", nowTime);
				connGr.query();
				
				while (connGr.next()) {
					gs.error("Scheduled job 'Update stuck connectors': updating " + lastRunTimeFieldName + " of " +
						connGr.getValue("name") + " connector from " + connGr.getValue(lastRunTimeFieldName) 
							 + " to " + nowTime.toString());
					
					connGr.setValue(lastRunTimeFieldName, nowTime);
					connGr.update();
				}
			}
			
			
			function getRunningConnectorsToCheck(connGr, connectorsToUpdate,  connectorsToCheck, lastRunningFieldName, timeout) {
				while (connGr.next()) {
					var lastUpdated = new GlideDateTime(connGr.getValue(lastRunningFieldName));
					if (lastUpdated <= timeout) {
						//running more than 2 hours -> remove the connector from running mode
						connectorsToUpdate.push(connGr.getUniqueValue());
						
						//If there any old connectorProbes that are still in Processing state then we will put it into error state as it should not run for this long.
						//If there is any issue with the connector and if its running from more than two hours, if mid server is restarted then ready+processing connectorprobes will be pickedup again
						//so putting processing records to error state, so that they will not be picked up midserver after restarting
						//search for all processing records from the last 2 hours
						var eccGr = new GlideRecord("ecc_queue");
						eccGr.addQuery("topic","ConnectorProbe");
						eccGr.addQuery("queue", "output");
						eccGr.addQuery("source", connGr.getValue("name"));
						//to distinguish its event run and not metric run
						eccGr.addQuery("payload","CONTAINS","script_type");
						eccGr.addQuery("state", "processing");
						//Whenever we do <=timeout query it will look at all old records and it may cause performance issues.
						//so to timebound the query will be checking from timeout-10mins to timeout time so that will fetch only 30 mins records
						eccGr.addQuery("sys_updated_on", ">=", lastUpdated);
						eccGr.addQuery("sys_created_on", ">=", lastUpdated);
						eccGr.query();

						while(eccGr.next()) {
							gs.info("*** Stuck Connectors kept " +connGr.getValue("name") +" events connectorProbe in ecc_queue table to Error state as its running from long time ***");
							eccGr.state = "error";
							eccGr.update();
						}
					}
					else {
						//running more than 2 minutes and less than 2 hours -> check if there is failed record in ecc_queue
						connectorsToCheck[connGr.getUniqueValue()] = true;
					}
				}
			}
			
			
			function getRunningMetricConnectorsToCheck(connGr, connectorsToUpdate, lastRunningFieldName) {
				// Decide what is the max time the metric connector can run according to mid.em.metric_connector_max_run_time_seconds
				// parameter (which control the max number of seconds to collect metrics in every cycle )
				var eccAgentConfigGr = new GlideRecord("ecc_agent_config");
				eccAgentConfigGr.addQuery("param_name", "mid.em.metric_connector_max_run_time_seconds");
				eccAgentConfigGr.query();
				var maxRunTime = 0;
				while(eccAgentConfigGr.next()) {
					// This parameter can be defined on every MID so we take the max value
					var maxRunTimeToCheck = parseInt(eccAgentConfigGr.value);
					if(maxRunTimeToCheck > maxRunTime)
						maxRunTime = maxRunTimeToCheck;
				}
				
				if(maxRunTime == 0)
					maxRunTime = 300; // default
				
				maxRunTime += 600; // Add 10 minutes to be on the safe side..
				gs.debug("Update stuck connectors: metric maxRunTime to check: " + maxRunTime);
				var timeout = new GlideDateTime();
				timeout.addSeconds(0 - maxRunTime);
				while (connGr.next()) {
					var lastUpdated = new GlideDateTime(connGr.getValue(lastRunningFieldName));
					if (lastUpdated <= timeout) {
						//running more than maxRunTime hours -> remove the connector from running mode
						connectorsToUpdate.push(connGr.getUniqueValue());
					}
				}
			}
			
			
			function checkIfKpiRunning(param) {
				for (var j in param) {
					if (param[j]["@name"] === "retrieve_kpi") {
						return true;
					}
				}
			}
			
			function supportConnectorsUpgradeSafe() {
				var gr = new GlideRecord("sys_trigger");
				gr.addQuery("name", "ASYNC: Event Management - Connector");
				gr.query();
				while (gr.next()) {
					gr.setValue("upgrade_safe", true);
					gr.update();
				}
			}
		};
