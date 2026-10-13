// Discovery

var ProbePostProcessor = Class.create();
ProbePostProcessor.prototype = {

    initialize : function(definition) {
        
		// Allow to override methods from constructor
		for (var property in definition)
            this[property] = definition[property];
    	
		this.run();
	},

    /**
     * Runs the probe instance
     */
    run : function() {
		
		// Get the results from the document
		var results = g_array_util.ensureArray(document.result);
		
		// if there's an error attribute in the "results" tag, or no results for some reason, let the sensor handle it.
        if (document['@error'] || results.length === 0)
			return;	
			
		// if probe_id is there then it is a multi-probe, then find the right result set
		// otherwise single probe
		var resultToProcess;
		if (JSUtil.nil(probe_id)) {
			resultToProcess = results[0]; // multi results don't make sense for 3P	
		} else {
			for (var i = 0; i < results.length; i++) {
				var r = results[i];
				
				// If empty continue to to next one
				if (this.checkEmptyPayload(r))
					continue;
				
				if (r['@id'] == probe_id)  {
					resultToProcess = r.results.result;					
					break;
				}
			}
		}
				
		// Lets process the result, could be undefined
		if (resultToProcess) {

			// If empty nothing to do, let sensor handle it
			if (this.checkEmptyPayload(resultToProcess) || this.checkEmptyPayload(resultToProcess.output))
				return;
			
			// Check for error, if error nothing to do, let sensor handle it
			if (this.checkErrorPayload(resultToProcess))
				return;
			
			// set the output, current, related_data		
			if (this.getParameter('topic') == 'WMIRunner')
				output = resultToProcess;
			else
				output = resultToProcess.output;
			
			// Call appropriate subclass postProcess
    		this.process();

        	// reset the output with the JSONfied ouput
			var result = {};
			
			// If empty, do not set current
			if (!JSUtil.isEmpty(current))
				result.current = current;
		
			// If empty, do not set related_data
			if (!JSUtil.isEmpty(related_data))
				result.related_data = related_data;			
						
			resultToProcess.output = new JSON().encodeObject(result);
		}
		else {
			this.warn('Could not find any results to process in ProbePostProcessor');
		}
    },
   
	checkErrorPayload: function(result) {
		var error = this.getAttribute(result, 'error');
        if (error) 
            return true;
        
        var errors = g_array_util.ensureArray(result.error);
        if (errors.length > 0) 
            return true;

        return false;
    },
	
	checkEmptyPayload: function(pTag) {
        // If empty the tag doesn't exist, then let's not even check it.
        if (pTag === undefined)
            return false;

        // If the tag is null, it means it contains no more data. For example: a tag of <output/> would be null.
        if (pTag === null)
            return true;

        // If the tag is an object, we need to make sure it actually contains data, and not just attributes.
        if (pTag instanceof Object)
            if (!this._checkContainsData(pTag))
                return true;

      return false;
    },
	
	_checkContainsData: function(obj) {
        // If a tag is an object, then we look to see if it actually contains more tags and not just attributes. (The 
        // attributes have an @ sign in the property, so basically anything that doesn't contain @ means it has more 
        // tags inside. An example would be <snmp source="10.10.10.10" timeout="true"/>
        for (var prop in obj)
            if (prop.indexOf("@") == -1)
                return true;

        return false;
    },
	
    /**
	 * Override this method to do the post processing
	 */
	process : function() {
	},
    
	/**
	 * Get parameter from the probe payload
	 */
    getParameter : function(param) {
        if (JSUtil.notNil(g_probe))
            return g_probe.getParameter(param);
        else
            return null;
    },

	log : function(str) {
		if (JSUtil.notNil(g_probe))
			DiscoveryLogger.info(str, g_probe.getParameter('probe_name'), g_probe.getEccQueueId(), null);
		else
			DiscoveryLogger.info(str, null, null, null);
	},
	
	warn : function(str) {
		if (JSUtil.notNil(g_probe))
			DiscoveryLogger.warn(str, g_probe.getParameter('probe_name'), g_probe.getEccQueueId(), null);
		else
			DiscoveryLogger.warn(str, null, null, null);
	},
	
    type: "ProbePostProcessor"
}
