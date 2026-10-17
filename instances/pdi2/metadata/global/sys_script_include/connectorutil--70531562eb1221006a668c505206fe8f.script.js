var ConnectorUtil = Class.create();

ConnectorUtil.prototype = {
	PROBE_NAME:"Third Party Connector Probe",
	PARAM_PREFIX:"__con_param__",
	LEGACY_METRIC_CONNECTORS:["3300ae1893e43200c7a7b67a357ffb1f", "5b3a69470f0b301091e2527685767e44", "38996c33c332210039a3553a81d3aeab", "7e9fcf10eb6221006a668c505206feaf", "b1886a7ddb6210108922274b13961929", "804428c84f202200331efd218110c7c6", "4a90c47243511110a86b78114bb8f2d9"],
	
	initialize: function() {}, 
	
	executeConnectors: function() {
		var ciGr =  new GlideRecord('em_connector_instance');
		ciGr.addQuery('active', true);
		ciGr.query();
		while (ciGr.next()) {
			var kpiActive = ciGr.getValue('kpi');
			if (kpiActive != true || this.isLegacyMetricConnector(""+ciGr.connector_definition.sys_id)) {
				this.handleEvents(ciGr);
			}
			if(kpiActive == true) {
				this.handleKpi(ciGr);
			}
		}
	},

	isLegacyMetricConnector: function(sysId) {
		return this.LEGACY_METRIC_CONNECTORS.includes(sysId);
	},

	handleKpi: function(ciGr) {
		var isRunning = ciGr.getValue('kpi_running');
		if(isRunning == true)
			return;

		var interval = parseInt(ciGr.getValue('kpi_schedule'));
		var lastRun = ciGr.getValue('kpi_last_run_time');
		var lastRunGdt = new GlideDateTime();
		
		if(!gs.nil(lastRun)) {
			lastRunGdt = new GlideDateTime(lastRun);
		}
		else{
			//for the first time we run
			lastRunGdt.addSeconds(-1 * interval);
		}
		
		var now = new GlideDateTime();
		lastRunGdt.addSeconds(interval);

		// it's time for a new run
		if (lastRunGdt.compareTo(now) <= 0) {
			var agentName = this.findValidAgentForMetricCollection(ciGr);
			if (!gs.nil(agentName)) {
				ciGr.setValue('kpi_running', true);
				ciGr.update();
				this.writeKpiToECC(ciGr, false, agentName);
				return;
			}

			var errorMessage = "[ConnectorUtil] HandleKpi: Can not execute without a valid mid server for " + ciGr.name;
			ciGr.setValue('kpi_running', false);
			ciGr.setValue('last_kpi_status', 'Error');
			ciGr.setValue('last_error_message', errorMessage);
			ciGr.setValue('kpi_last_run_time', now);
			ciGr.update();	
		}
	},

	handleEvents: function(ciGr) {
		var isRunning = ciGr.getValue('running');
		if(isRunning == true)
			return;

		var interval = parseInt(ciGr.getValue('schedule'));
		var lastRun = ciGr.getValue('last_run_time');
		var lastRunGdt = new GlideDateTime();
		
		if(!gs.nil(lastRun)) {
			lastRunGdt = new GlideDateTime(lastRun);
		}
		else{
			//for the first time we run
			lastRunGdt.addSeconds(-1 * interval);
		}
		
		var now = new GlideDateTime();
		lastRunGdt.addSeconds(interval);

		// it's time for a new run
		if (lastRunGdt.compareTo(now) <= 0) {
			var agentName = this.findAgent(ciGr);
			if (gs.nil(agentName)) {
				gs.log("[ConnectorUtil] Can not execute without a mid server for " + ciGr.name);
				ciGr.setValue('running', false);
				ciGr.setValue('last_status', 'Error');
				ciGr.setValue('last_error_message', "Can not execute without a mid server.");
				ciGr.setValue('last_run_time', now);
				ciGr.update();
				return;
			}
			ciGr.setValue('running', true);
			ciGr.update();
			this.writeToECC(ciGr, false, agentName);
		}
	},

	// pick the agent with ip range and capabilities
	findAgent: function(ciGr){
				
		// 1. look if there are explicitly defined MIDs for the instance (used in Domain Separation) 
		var potentialServers = this.findMIDsDefinedForConnector(ciGr);
		var detailsForLog = "found in predefined list for the connector instance";
		var foundMid;
		if (potentialServers.length != 0){
			for (var index = 0; index < potentialServers.length; index++) {
				var gr = new GlideRecord('ecc_agent');
				gr.addQuery('name', potentialServers[index]);
				gr.addQuery('status','Up');
				gr.addQuery('validated','true');
				gr.query();
				if (gr.next()) {
					foundMid = gr.name;
					gs.log("findAgent for connector instance " + ciGr.sys_id + " Use Mid:" + foundMid + " " + detailsForLog);
					return foundMid;
				}
			}
			//If list exists and none of the defined MIDs are up and valid
			return foundMid;
		}
		
		// 2. if there are no defined MIDs for this connector instance, search for a suitable MID according to the IP range
		if (JSUtil.nil(potentialServers) || potentialServers.length === 0) {

			var midServerFinder = new MIDServerFinder();
			midServerFinder.setRangesByIPOrHostname(ciGr.host);
			midServerFinder.setCapabilities(this._getCapabilities(ciGr.connector_definition));

			potentialServers = midServerFinder.getMIDServers();
			if (!JSUtil.nil(potentialServers) && potentialServers.length > 0) {
				foundMid = potentialServers[0];
				detailsForLog = "found according to MID IP Range";
			}
		}		

		// 3. if no MID was found by range, bring the default
		if (JSUtil.nil(potentialServers) || potentialServers.length === 0) {
				foundMid = this._getDefaultMidServer();
				detailsForLog = "use default";
		}
		
	    gs.log("findAgent for connector instance " + ciGr.sys_id + " Use Mid:" + foundMid + " " + detailsForLog);
		return foundMid;
		
	},

	// find all the agents with ip range and capabilities for metrics collection
	findValidAgentForMetricCollection: function(ciGr){
		// Look if there are explicitly defined MIDs for the instance (used in Domain Separation) 
		var potentialServers = this.findMIDsDefinedForConnector(ciGr);
		var potentialAgents = [];

		if (potentialServers.length != 0){
			for (var index = 0; index < potentialServers.length; index++) {
				var gr = new GlideRecord('ecc_agent');
				gr.addQuery('name', potentialServers[index]);
				gr.addQuery('status','Up');
				gr.addQuery('validated','true');
				gr.query();
				if (gr.next()) {
					var agentName = gr.name.toString();
					if (gs.nil(agentName)) {
						continue;
					}

					var extCont = new GlideRecord("ecc_agent_ext_context");
					extCont.addQuery("sys_class_name", "ecc_agent_ext_context_metric");
					extCont.addQuery("status", "IN", "Started,Warning");
					extCont.addQuery("mid_server", gr.getUniqueValue());
					extCont.query();

					while (extCont.next())
						potentialAgents.push(agentName);
				}
			}

			if (potentialAgents.length > 0) {
				var chosenAgent = potentialAgents[Math.floor(Math.random() * potentialAgents.length)]
				gs.log("findValidAgentForMetricCollection will use agent: " + chosenAgent);
				return chosenAgent;
			} else {
				gs.log("There is no valid MID Server that has ITOA Metric Extension and is in Started or Warning state.");
			}
		}

		gs.log("There is no valid MID Server to use.");
		return "";
	},
	
	_getDefaultMidServer: function(){
		var defaultMidServer = GlideProperties.get("mid.server.connector_default");
		
		if (!JSUtil.nil(defaultMidServer)) {
			var gr = new GlideRecord('ecc_agent');
			gr.addQuery('name', defaultMidServer);
			gr.query();
			
			if (!gr.next()) {
				gs.log('The configured default MID Server (' + defaultMidServer + ') is not valid');
				defaultMidServer = "";
			} else if ('' + gr.status != 'Up') {
				gs.log('The configured default MID Server (' + defaultMidServer + ') is not available');
				defaultMidServer = "";
			} else if ('' + gr.validated != 'true'){
				gs.log('The configured default MID Server (' + defaultMidServer + ') was not validated');
				defaultMidServer = "";
			}
		} else {
			gs.log('There is no MID Server configured to run this activity');
		}
		
		if (!JSUtil.nil(defaultMidServer)) {
			gs.log('The default MID Server is being used.  For more control over which MID server executes commands against a particular target, configure IP Ranges and Capabilities for your MID Servers.');
		}
		
		return ''+defaultMidServer;
	},
	findMIDsDefinedForConnector:function(ciGR) {

		var conMidMap = new GlideRecord('em_connector_instance_to_mid');
		conMidMap.addQuery('connector', ciGR.sys_id);
		conMidMap.orderBy("sys_created_on");
		conMidMap.query();			
		
		var results= [];
		while (conMidMap.next()){
			 results.push(conMidMap.mid_server.name + '');
		}

		return results;
		
	},
	_getCapabilities:function(conDefId) {
		var caps = [];
		var conCap = new GlideRecord('em_conn_mid_capability_m2m');
		conCap.addQuery('connector_definition', conDefId);
		conCap.query();
		while(conCap.next()) {
			var capGr = new GlideRecord('ecc_agent_capability');
			capGr.get(conCap.capability);
			caps.push(capGr.capability);
		}
		return caps;
	},
	
	writeKpiToECC:function(ciGr, isTest, agentName){
		if (gs.nil(agentName)) {
			gs.log("[ConnectorUtil] Can not continue without a mid server");
			return;
		}

		var probe = SncProbe.get(this.PROBE_NAME);
		probe.setSource(ciGr.name);
		probe.setEccPriority(gs.getProperty('evt_mgmt.connector_metriccollection.eccprobe_priority', '0'));
		probe.addParameter('connector', ciGr.sys_id);
		probe.addParameter(this.PARAM_PREFIX + 'connectorSysId', ciGr.sys_id);
		probe.addParameter('connector_name', ciGr.name);
		probe.addParameter('last_kpi_signature', ciGr.last_kpi_signature);
		probe.addParameter(this.PARAM_PREFIX + 'kpi', ciGr.kpi);
		scriptName = ciGr.connector_definition.javascript_to_run.name;

		probe.addParameter('script', scriptName);
		if (gs.nil(scriptName)) {
			gs.log("[ConnectorUtil] Can not continue: java script is empty for connector instance: " + ciGr.name);
			return;
		}
		
		if(ciGr.kpi_win_auth == "false" || ciGr.kpi_win_auth == false)
			probe.addParameter('database_credential_id', ciGr.kpi_credential.sys_id);
		
		probe.addParameter('credential_id', ciGr.credential.sys_id);
		
		if (gs.nil(ciGr.kpi_host)) {
			probe.addParameter('host', ciGr.host);
		} else {
			probe.addParameter('host', ciGr.kpi_host);
		}
		
		if(ciGr.kpi_use_instance_name == true)
			probe.addParameter('instanceName', ciGr.kpi_database_instance_name);
		else
		    probe.addParameter('database_port', ciGr.kpi_port);
		// add connecter instance parameters
		var paramsGr = GlideRecord('em_connector_instance_value');
		paramsGr.addQuery('connector_instance', ciGr.sys_id);
		paramsGr.query();
		while(paramsGr.next()) {
			probe.addParameter(this.PARAM_PREFIX + paramsGr.name,  paramsGr.value);
		}
		
		if (isTest) {
			probe.addParameter('testKpi', true);
		}
		probe.addParameter('retrieve_kpi', true);

		return probe.createForMidServer(agentName, null);
	},

	writeToECC:function(ciGr, isTest, agentName){
		if (gs.nil(agentName)) {
			gs.log("[ConnectorUtil] Can not continue without a mid server");
			return;
		}
		var probe = SncProbe.get(this.PROBE_NAME);
		probe.setSource(ciGr.name);
		probe.setEccPriority(gs.getProperty('evt_mgmt.connector_eventcollection.eccprobe_priority', '0'));
		probe.addParameter('connector', ciGr.sys_id);
		probe.addParameter(this.PARAM_PREFIX + 'connectorSysId', ciGr.sys_id);
		probe.addParameter('connector_name', ciGr.name);
		probe.addParameter('last_event', ciGr.last_event_signature);
		probe.addParameter('script_type', ciGr.connector_definition.script_type);
		
		if(isTest && ciGr.kpi == true) {
			probe.addParameter(this.PARAM_PREFIX + 'kpi', ciGr.kpi);
			
			
			if(ciGr.kpi_win_auth == "false" || ciGr.kpi_win_auth == false)
				probe.addParameter('database_credential_id', ciGr.kpi_credential.sys_id);
			probe.addParameter(this.PARAM_PREFIX + 'database_host', ciGr.kpi_host);
			
			if(ciGr.kpi_use_instance_name == true)
				probe.addParameter(this.PARAM_PREFIX + 'instanceName', ciGr.kpi_database_instance_name);
			else
				probe.addParameter(this.PARAM_PREFIX + 'database_port', ciGr.kpi_port);
		}
		var connectorTags = this.getConnectorTags(ciGr);
		var scriptName = '';
		if (ciGr.connector_definition.script_type == 'groovy'){
			scriptName = ciGr.connector_definition.groovy_script.name;
			probe.addParameter(this.PARAM_PREFIX + 'connectorTags', connectorTags);
		}
		else{
			scriptName = ciGr.connector_definition.javascript_to_run.name;
			probe.addParameter('connector_tags', connectorTags);
		}
		probe.addParameter('script', scriptName);
		probe.addParameter('credential_id', ciGr.credential.sys_id);
		probe.addParameter('host', ciGr.host);
		
		// add connecter instance parameters
		var paramsGr = GlideRecord('em_connector_instance_value');
		paramsGr.addQuery('connector_instance', ciGr.sys_id);
		paramsGr.query();
		while(paramsGr.next()) {
			probe.addParameter(this.PARAM_PREFIX + paramsGr.name,  paramsGr.value);
		}
		
		if (isTest) {
			probe.addParameter('test', true);
		}
		return probe.create(agentName);
	},
	
	// sensor to call
	updateConnectorInstance: function(cId, lastEvent, lastStatus, lastError){
		var ciGr = new GlideRecord('em_connector_instance');

		try {

			if (!ciGr.get(cId)) {
				gs.log('Could not find connector instance ' + cId);
				return;
			}
			ciGr.setValue('last_event_signature', lastEvent);
			ciGr.setValue('running', false);
			if (lastStatus == 'SUCCESS') {
				ciGr.setValue('last_status', 'Success');
				lastError = "";
			} else {
				ciGr.setValue('last_status', 'Error');
				lastError = "EVENTS\n-------------------------------------------------------------\n" + lastError;
			}
			var lastErrorUtil = new LastErrorUtils();
			lastErrorUtil.updateErrorMsg(ciGr, "events", lastError);
			var now = new GlideDateTime();
			ciGr.setValue('last_run_time', now);

			// em_connector_instance update action can be aborted by business rules
			if (!ciGr.update() || ciGr.isActionAborted()) {
				gs.logError('[ConnectorUtil] - Connector instance record: ' + cId + ' could not be updated. Action aborted.');
			}
		} catch (e) {
			gs.logError('[ConnectorUtil] - Unexcpected error while updating connector instance' + e);
		}
	},

	updateTestConnectionStatus: function(cId, lastStatus, lastError) {
		var ciGr = new GlideRecord('em_connector_instance');
		try {
			if (!ciGr.get(cId)) {
				gs.log('Could not find connector instance ' + cId);
				return;
			}
			ciGr.setValue('running', false);
			if (lastStatus == 'SUCCESS') {
				lastStatus = "Success";
				lastError = "";
			} else {
				lastError = "TEST CONNECTION\n-------------------------------------------------------------\n" + lastError;
				lastStatus = "Error";
			}
			
			var lastErrorUtil = new LastErrorUtils();
			//Update status value with either last event status or last metric status based on type of connector 
			if (!ciGr.connector_definition.kpi) {
				lastErrorUtil.updateErrorMsg(ciGr, "events", lastError);
				ciGr.setValue('last_status', lastStatus);
			} else {
				lastErrorUtil.updateErrorMsg(ciGr, "kpi", lastError);
				ciGr.setValue('last_kpi_status', lastStatus);
			}
			
			if (!ciGr.update() || ciGr.isActionAborted()) {
				gs.logError('[ConnectorUtil] - Connector instance record: ' + cId + ' could not be updated. Action aborted');
			}
		} catch (e) {
			gs.logError('[ConnectorUtil] - Unexcpected error while updating connector instance' + e);
		}
	},

	getConnectorTags: function(ciGr) {

		// System property added to disable connector tags functionality. 
		var connectorTagsEnabled = gs.getProperty('evt_mgmt.connector_tags_enabled', 'true');
		if(connectorTagsEnabled != 'true')
			return null;

		// Connector tags are stored in 'sn_itom_integ_app' plugin so, tag functionality is available when this plugin is installed.
		// Before retrieving connector tags, first check if the 'sn_itom_integ_app' plugin is installed and call api to fetch tags only when its installed.
		var pluginManager = new GlidePluginManager();
		if (pluginManager.isActive('sn_itom_integ_app') && typeof sn_itom_integ_app.ConnectorTagsUtil !== 'undefined') {
			return new sn_itom_integ_app.ConnectorTagsUtil().getConnectorTags(ciGr.sys_id);
		}
		return null;
		
	},
	
	type: 'ConnectorUtil'
};
