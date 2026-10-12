new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {    
		// parse the results from our lsof output, leaving the result in result.current.connections...
		var lp = new LSOFParser();
		lp.parse(output);
		related_data.connections = lp.tcp;
		related_data.isValid = lp.isValid;
		related_data.error_string = lp.errorString;
    },
   
    type: "ProbePostProcessor"
});
