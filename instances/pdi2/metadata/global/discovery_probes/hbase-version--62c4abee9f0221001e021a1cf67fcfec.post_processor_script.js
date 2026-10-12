new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
		var lines = output.split("\n");
		
		// no results
		if (lines.length == 0)
			return;
		
		var regexp = new RegExp("version\n([^, ]+)", 'im');
		var match = regexp.exec(output);
		if (match)
			current.version = match[1].trim();			
	},
   
    type: "ProbePostProcessor"
});
