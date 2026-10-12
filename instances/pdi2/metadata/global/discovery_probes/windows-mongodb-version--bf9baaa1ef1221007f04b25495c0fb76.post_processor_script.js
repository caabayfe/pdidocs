new ProbePostProcessor({
	/**
     * Runs the probe instance
     */
	process : function() {
        var lines = output.split("\n");
		for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (line.indexOf("db version ") > -1) {
				var matches = line.match(/db version v([\d\w.]+)/);
				if (matches)
					current.version = matches[1];
            } 
		}
	},
	
	type: "ProbePostProcessor"
});	
	
