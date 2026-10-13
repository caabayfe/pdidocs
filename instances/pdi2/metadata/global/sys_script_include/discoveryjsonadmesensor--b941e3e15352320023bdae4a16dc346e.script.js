var DiscoveryJSONADMESensor = Class.create();
DiscoveryJSONADMESensor.prototype = Object.extendsObject(DiscoveryJSONSensor, {

    finish: function(){
		// Get the errorMap in the result
		var result = g_array_util.ensureArray(document.result)[0];
		var outputObj = new JSON().decode(result.output);
		var errorMap = new JSON().decode(outputObj.errorMap);
		if (errorMap == null)
			errorMap = [];

		// Fixing struture for Windows ADME
		if (!outputObj.collector_info && outputObj.current)
			outputObj.collector_info = outputObj.current;

		// Query the discovery status and check if we are discovering processes and connections only.
		var statusId = this.getAgentCorrelator();
		var gr = new GlideRecord("discovery_status");
		if (statusId && gr.get('sys_id', statusId))
			this.isProcessDiscovery = (gr.discover == "Processes/Connections");
		else {
			gs.error("Can't get discovery status record in DiscoveryJSONADMESensor");
			errorMap.push({"errorCode" : "SN-5999", "errorMsg" : "Cannot get discovery status record in DiscoveryJSONADMESensor"});
		}

		// Check which adm we should launch based on OS type
		var osType = this.getParameter("os_type");
		// If there is no osType, query the cmdb_ci table to get it
		if (StringUtil.nil(osType)) {
			var ciGr = this.getCmdbRecord();

			//ciGr is null in case of Test Probe
			if (ciGr == null) {
				DiscoveryLogger.error("ADME sensor failed to trigger ADM probe.  Unable to detect type of OS.", "Discovery", this.getEccQueueId());
				errorMap.push({"errorCode" : "SN-5999", "errorMsg" : "ADME sensor failed to trigger ADM probe.  Unable to detect type of OS."});
				this.handleErrorMap(errorMap);
				return;
			}

			osType = ciGr.os + "";
		}

		// Always convert os type to upper case.
		osType = osType.toUpperCase();

		// If we have an empty result, trigger ADM and return
		if (gs.getProperty("glide.discovery.enable_adme") == "true" && (typeof related_data == 'undefined' || JSON.stringify(related_data) === JSON.stringify({}))) {
			// For any reason there is no result, trigger regular ADM
			DiscoveryLogger.info("ADME collector didn't return any result, triggering ADM...", "Discovery", this.getEccQueueId());

			var admProbeName;
			if (osType.indexOf("LINUX") > -1)
				admProbeName = this.isProcessDiscovery ? "Unix - ADM netstat" :"Unix - ADM";
			else if (osType.indexOf("AIX") > -1)
				admProbeName = this.isProcessDiscovery ? "AIX - ADM Multiple" : "AIX - ADM";
			else if (osType.indexOf("HPUX") > -1 || osType.indexOf("HP/UX") > -1 || osType.indexOf("HP_UX") > -1)
				admProbeName = this.isProcessDiscovery ? "HP-UX - ADM Multiple" : "HP-UX - ADM";
			else if (osType.indexOf("SOLARIS") > -1)
				admProbeName = this.isProcessDiscovery ? "Solaris - ADM Multiple" : "Solaris - ADM";
			else if (osType.indexOf("WINDOWS") > -1)
				admProbeName = this.isProcessDiscovery ? "Windows - ADM Multiple" : "Windows - ADM";

			if (typeof admProbeName == 'undefined' || StringUtil.nil(admProbeName)) {
				DiscoveryLogger.error("ADME sensor failed to trigger ADM probe, please check OS type is discovered correctly.", "Discovery", this.getEccQueueId());
				errorMap.push({"errorCode" : "SN-5999", "errorMsg" : "ADME sensor failed to trigger ADM probe, please check OS type is discovered correctly."});
				this.handleErrorMap(errorMap);
				return;
			}

			gs.log("ADME didn't bring back any result from " + this.getSource() + ", will trigger " + admProbeName);

			// Create the adm probe with parameters.
			var admProbe = SncProbe.get(admProbeName);
            admProbe.setSource(this.getSource());
			admProbe.addParameter("port", this.getParameter("port"));
			admProbe.addParameter("cmdb_ci", this.getCmdbRecord().sys_id);
			admProbe.addParameter('os_type', osType);
			admProbe.addParameter('protocol',this.getParameter('protocol'));
			admProbe.addParameter('mid_selector_details', this.getParameter('mid_selector_details'));
			var ssmObject = this.getParameter('ssm_object');
			if (ssmObject)
				admProbe.addParameter('ssm_object', ssmObject);
            admProbe.setEccPriority(this.getParameter('priority'));
			if (osType.indexOf("SOLARIS") > -1)
				admProbe.addParameter("zone", "global");

			admProbe.create(this.getAgent(), this.getEccQueueId());

			this.handleErrorMap(errorMap);
			return;
		}

		// Handle the errors before we run the ADM logic.
		this.handleErrorMap(errorMap);

		if (typeof related_data == 'undefined' || JSON.stringify(related_data) === JSON.stringify({}))
			return;    // No related_data to reconcile.  Aborting

		this.running_processes = related_data.processes;
		this.connections = related_data.connections;

		// TODO: Following logic is the same as DiscoveryJSONADMSensor, not sure if we should apply the process filter.
		// massage our raw connections data a bit...
		if (this.connections) {
        	this.connections = new CookConnections('' + this.getCmdbCi()).process(this.connections);
		}
		else{
			DiscoveryLogger.error("Failed to retrieve connection data by the probe, hence TCP connections are not discovered");
		}
        // enrich the connections and running processes...
        var epac = new EnrichProcessesAndConnections(this);
		epac.checkCountForClassify = true;
		if (osType.indexOf("WINDOWS") > -1)
			epac.fromADME = true;
        epac.process();

		this.adm = new ApplicationDependencyMapping(this);
		// filter the running processes for only things that we classify...
		if (gs.getProperty('glide.discovery.active_processes_filter', 'false') == 'true' &&
			gs.getProperty('glide.discovery.auto_adm', 'false') != 'true')
        	this.running_processes = this.adm.matched_processes;

		epac.reconcile();

        // deduplicate connections before reconciling...
        epac.dedupeConnections();
        this.addToRelatedList('cmdb_tcp', this.connections, 'computer', 'type,ip,port');
	},

	// Invoke the ADM process.
	after: function() {
		// If the discovery is for process and connections only, then don't lauch ADM
		if (this.isProcessDiscovery)
			return;

        this.adm.process();
    },

    type: 'DiscoveryJSONADMESensor'
});
