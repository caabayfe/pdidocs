new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {
		var lines = output.split("\n");
		
		// no results
		if (lines.length == 0)
			return;
		
		var regexp = new RegExp("^\\d+\\s+([^\\s]+)", 'im');
		var match = regexp.exec(output);
		if (match) {
			var mainClass = match[1].trim();
			var shortName = mainClass.substring( mainClass.lastIndexOf('.') + 1);
			current.name = shortName + '@' + this.getParameter('computerName');
		}
	},
   
    type: "ProbePostProcessor"
});
