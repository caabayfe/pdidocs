var DiscoveryJSONMultiSensor = Class.create();
  
DiscoveryJSONMultiSensor.prototype = Object.extendsObject(DiscoveryMultiSensor, {    
	/**
	 * Override the runMultiProbeScript function in MultiSensor
	 * Decode the json output and run the multi-probe script.
	 * @param string script
	 * @param XMLObj(//result/results/result) probeResult
	 * @param GlideRecord(discovery_probes) probeRecord
	 * @extendable Override to change function declaration.
	 */
	runMultiProbeScript: function(script, probeResult, probeRecord) {
		// prepare current and related_list
		this.prepareJSON(probeResult);

        var sensorScript = eval( '(' + script + ')' );  // get the multi sensor script into a variable...
    	sensorScript(this.ciData, this.debug, this);  // execute the sensor script...		
	},
    
    type: "DiscoveryJSONMultiSensor"
});
