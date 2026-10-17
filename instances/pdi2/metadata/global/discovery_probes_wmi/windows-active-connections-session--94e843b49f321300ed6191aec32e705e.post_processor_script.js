new ProbePostProcessor({
    
run : function() {   	
		// Define global objects for use by subclass 
		current = {};
		related_data = {};

		// If WMIRunner probe, convert the xml output to json before processing
		if (this.getParameter('topic') == 'WMIRunner') {
			var xmlHelper = new XMLHelper();
			var xmlResult = xmlHelper.toObject(output);	
			if (!JSUtil.nil(xmlResult))
				output = xmlResult;
		}
		
		// Class appropriate subclass postProcess
    	this.process();
        
		var result = {};
		// If we have any logs, add it to the output
		if (this.logs.length > 0) {
			result.logs = this.logs;
		}
		
		// If empty, do not set current
		if (!JSUtil.isEmpty(current))
			result.current = current;
		
		// If empty, do not set related_data
		if (!JSUtil.isEmpty(related_data)) 
			result.related_data = related_data;
				
    	// Compare results with cache and send back json response
    	g_probe.setPostProcessOutput(result.current.processes);
    },	
	/**
     * Runs the probe instance
     */    
    process : function() { 
		var os = g_array_util.ensureArray(output.Win32_OperatingSystem);
        var Win32_os = os[0];
		var Win32_osName = Win32_os.Name;
		
		var host = this.getParameter('source');
		var provider = new Packages.com.snc.sw.providers.wmi.WMIProviderImpl();
		
		try {
			provider.setHost(host);
			if (Win32_osName.indexOf('Windows 2000') != -1) {
				current.processes = provider.executeCommand('netstat.exe -anp TCP');
			}
			else {
				current.processes = provider.executeCommand('netstat.exe -anop TCP');
			}
		}
		finally {
			provider.closeSession();
		}
	}
});
