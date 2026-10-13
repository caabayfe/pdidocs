var DiscoveryMultiSensor = Class.create();
  
DiscoveryMultiSensor.prototype = Object.extendsObject(DiscoverySensor, {    
    // Run the multi sensor scripts to process the information for one of our results (called once for each probe)...
    process: function(result) {
        var probe_id = result['@id'];
		var probeCache = new SNC.ProbeCache();
		var dpgr = probeCache.getBySysId(probe_id);
        var scriptName = dpgr.name;

        // if there's error attribute in the "results" tag, then log it...
        if (result.results['@error'])
            this.processError('' + result.results['@error']);

        //This is the case where we only get <result/> and nothing else. Windows probes could return this.
        if (result.results.result === null) {
            this.logEmptyPayload(scriptName);
            return;
        }

        // Checks for error and handles it by printing out log msgs
        // Also sets "has_error" which is used to stop identification from continuing and launching exploration.
        if (this.checkErrorPayload(result.results.result)) {
            this.has_error = true;
            return;
        }

        if (this.checkEmptyPayload(result.results.result)) {
            this.logEmptyPayload(scriptName);
            return;
        }

        var msgr = new GlideRecord('discovery_sensor_multi_probe');
        msgr.addQuery('parent', sensorId);  // sensorId is a global set by ASensor (Java)...
        msgr.addQuery('reacts_to_probe', probe_id);
        msgr.query();
        while (msgr.next()) {
            var script = msgr.getValue('script');
            if (!this.validateScript(script, msgr)) 
                continue;

			try {
				this.runMultiProbeScript(script, result.results.result, dpgr);
			} catch (e) {
				if (e instanceof DiscoveryException)
					throw e;
				
				throw new DiscoveryException('MultiProbe script error for probe `' + scriptName + '`: ' + e, e); 
			}
        }
    },
	
	/**
	 * Runs a multi-probe script against a probe result.
	 * @param string script
	 * @param XMLObj(//result/results/result) probeResult
	 * @param GlideRecord(discovery_probes) probeRecord
	 * @extendable Override to change function declaration.
	 */
	runMultiProbeScript: function(script, probeResult, probeRecord) {
            var sensorScript = eval( '(' + script + ')' );  // get the multi sensor script into a variable...
            sensorScript(probeResult, this.ciData, this.debug, this);  // execute the sensor script...		
	},

    validateScript: function(script, msgr) {
        if (StringUtil.notNil(script))
            return true;

        DiscoveryLogger.error('Multi sensor script (sys_id:' + msgr.sys_id + ') has empty script.', this.type, this.getEccQueueId());
        return false;
    },

    logEmptyPayload: function(name) {
		var msg = "sensor script for " + name + " has no payload data to process.";
		if (g_device)
			g_device.log(msg, this.getSensorName());
		else
			DiscoveryLogger.log(DiscoveryLogger.INFO, msg, this.getSensorName(), this.getEccQueueId(), null, null);

    },
    
    type: "DiscoveryMultiSensor"
});
